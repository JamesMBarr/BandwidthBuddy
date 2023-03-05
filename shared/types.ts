import type { Timestamp } from "@google-cloud/firestore";

interface MetadataUser {
  id: string;
  email: string;
}

interface Metadata {
  user: MetadataUser;
}

interface RawMeasurement {
  timestamp: string;
  download: {
    bandwidth: number;
  };
  upload: {
    bandwidth: number;
  };
  ping: {
    latency: number;
  };
}

interface EnrichedMeasurement extends RawMeasurement {
  // Non measurement data added during initial storage
  __metadata: Metadata;
}

interface ProcessedMeasurement {
  user: MetadataUser;
  /** Download speed in bits per second (bps)*/
  download: number;
  /** Upload speed in bits per second (bps)*/
  upload: number;
  latency: number;
  rawFileId: string;
  measurementDt: Timestamp;
  storageDt: Timestamp;
  createdDt: Timestamp;
}

const isRawMeasurement = (obj: any): obj is RawMeasurement => {
  return (
    obj.timestamp !== undefined &&
    obj.download?.bandwidth !== undefined &&
    obj.upload?.bandwidth !== undefined &&
    obj.ping?.latency !== undefined
  );
};

const isEnrichedMeasurement = (obj: any): obj is EnrichedMeasurement => {
  return (isRawMeasurement(obj) as any) && obj.__metadata !== undefined;
};

export {
  isRawMeasurement,
  isEnrichedMeasurement,
};

export type {
  RawMeasurement,
  EnrichedMeasurement,
  ProcessedMeasurement,
}
