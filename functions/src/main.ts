import { firestore } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { UserRecord } from "firebase-functions/v1/auth";

import firebaseConfig from "../../firebaseConfig.json";
import { EnrichedMeasurement, RawMeasurement } from "../../shared/types";

export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const bucket = getStorage().bucket();
export const store = firestore();

export const uploadToBucket = (
  user: UserRecord,
  rawMeasurement: RawMeasurement
) => {
  const filename = `${user.email}/${new Date().toISOString()}.json`;

  const enrichedMeasurement: EnrichedMeasurement = {
    ...rawMeasurement,
    __metadata: { user: { id: user.uid, email: user.email! } },
  };

  return bucket.file(filename).save(JSON.stringify(enrichedMeasurement));
};
