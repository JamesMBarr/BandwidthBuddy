import { firestore } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v1";
import { UserRecord } from "firebase-functions/v1/auth";
import { onRequest } from "firebase-functions/v2/https";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { LoginTicket, OAuth2Client } from "google-auth-library";

import firebaseConfig from "../../firebaseConfig.json";
import { checkEnvVar } from "../../shared/env";
import {
  isEnrichedMeasurement,
  type EnrichedMeasurement,
  type ProcessedMeasurement,
} from "../../shared/types";

initializeApp(firebaseConfig);

exports.storemeasurement = onRequest(
  {
    region: "europe-west2",
  },
  async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(403).send("Unauthorized");
      return;
    }

    logger.debug("Found authZ header");
    const tokenId = authHeader!.split("Bearer ")[1];

    const CLIENT_ID = checkEnvVar("CLIENT_ID");
    const client = new OAuth2Client(CLIENT_ID);

    let ticket: LoginTicket | null = null;
    try {
      ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: CLIENT_ID,
      });
    } catch (error) {
      logger.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
      return;
    }

    const payload = ticket.getPayload()!;

    if (!payload.email) {
      logger.log("No email provided in payload");
      res.status(403).send("Unauthorized");
      return;
    }

    const auth = getAuth();

    let user: UserRecord;
    try {
      user = await auth.getUserByEmail(payload.email);
      logger.info(`Found account associated with email: ${user.email}`);
    } catch (error) {
      logger.info(`No account associated with email: ${payload.email}`);
      res.status(403).send("Unauthorized");
      return;
    }

    if (user.disabled) {
      logger.info(`User account disabled: ${payload.email}`);
      res.status(403).send("Unauthorized");
      return;
    }

    const bucket = getStorage().bucket();

    const filename = `${payload?.email}/${new Date().toISOString()}.json`;

    const rawMeasurement = JSON.parse(req.rawBody.toString());

    // TODO: type is necessarily correct
    const enrichedMeasurement: EnrichedMeasurement = {
      ...rawMeasurement,
      __metadata: { user: { id: user.uid, email: user.email! } },
    };

    bucket.file(filename).save(JSON.stringify(enrichedMeasurement));

    res.status(202).send("Accepted");
    return;
  }
);

exports.ingestmeasurement = onObjectFinalized(
  {
    region: "europe-west2",
  },
  async (e) => {
    logger.info(`Ingest triggered`);

    const { name: filename } = e.data;

    // get the triggering file from storage
    const bucket = getStorage().bucket();
    const content = await bucket.file(filename).download();
    const enrichedMeasurement = JSON.parse(content.toString());

    if (!isEnrichedMeasurement(enrichedMeasurement)) {
      throw Error("Unsupported measurement schema");
    }

    // TODO: convert dt string to dt objs
    const readingDoc: ProcessedMeasurement = {
      user: enrichedMeasurement.__metadata.user,
      download: enrichedMeasurement.download.bandwidth * 8,
      upload: enrichedMeasurement.upload.bandwidth * 8,
      latency: enrichedMeasurement.ping.latency,
      rawFileId: e.data.id,
      measurementDt: enrichedMeasurement.timestamp,
      storageDt: e.time,
      createdDt: new Date().toISOString(),
    };

    const measurements = firestore().collection("measurements");
    measurements.add(readingDoc);

    logger.info("Measurement added to collection");
  }
);
