import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { LoginTicket, OAuth2Client } from "google-auth-library";
import { checkEnvVar } from "../../shared/env";
import { logger } from "firebase-functions/v1";

import firebaseConfig from "../../firebaseConfig.json";
import { UserRecord } from "firebase-functions/v1/auth";

initializeApp(firebaseConfig);

exports.addreading = onRequest(
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

    const filename = `${payload?.email}/${new Date().toISOString()}`;
    bucket.file(filename).save(req.rawBody);

    res.status(202).send("Accepted");
    return;
  }
);
