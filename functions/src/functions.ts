import { Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v1";
import { UserRecord } from "firebase-functions/v1/auth";
import { onRequest } from "firebase-functions/v2/https";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { LoginTicket, OAuth2Client } from "google-auth-library";

import { auth, bucket, store, uploadToBucket } from "@/main";
import { checkEnvVar } from "@shared/env";
import { isEnrichedMeasurement, ProcessedMeasurement } from "@shared/types";

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

    // TODO: add is raw measurement check
    const rawMeasurement = JSON.parse(req.rawBody.toString());
    await uploadToBucket(user, rawMeasurement);

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
    const content = await bucket.file(filename).download();
    const enrichedMeasurement = JSON.parse(content.toString());

    if (!isEnrichedMeasurement(enrichedMeasurement)) {
      throw Error("Unsupported measurement schema");
    }

    const readingDoc: ProcessedMeasurement = {
      user: enrichedMeasurement.__metadata.user,
      download: enrichedMeasurement.download.bandwidth * 8,
      upload: enrichedMeasurement.upload.bandwidth * 8,
      latency: enrichedMeasurement.ping.latency,
      rawFileId: e.data.id,
      measurementDt: Timestamp.fromDate(
        new Date(enrichedMeasurement.timestamp)
      ),
      storageDt: Timestamp.fromDate(new Date(e.time)),
      createdDt: Timestamp.now(),
    };

    const measurements = store.collection("measurements");
    measurements.add(readingDoc);

    logger.info("Measurement added to collection");
  }
);
