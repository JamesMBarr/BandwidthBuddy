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
  download: number;
  upload: number;
  latency: number;
  rawFileId: string;
  measurementDt: string;
  storageDt: string;
  createdDt: string;
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
  EnrichedMeasurement,
  ProcessedMeasurement,
};
