import { auth, uploadToBucket } from "@/main";
import { RawMeasurement } from "@shared/types";

const users = [
  {
    uid: "uid1",
    email: "james.matthew.barr@gmail.com",
    passwordHash: Buffer.from("passwordHash1"),
    passwordSalt: Buffer.from("salt1"),
  },
  {
    uid: "uid2",
    email: "user2@example.com",
    passwordHash: Buffer.from("passwordHash1"),
    passwordSalt: Buffer.from("salt1"),
  },
  {
    uid: "uid3",
    email: "user3@example.com",
    passwordHash: Buffer.from("passwordHash2"),
    passwordSalt: Buffer.from("salt2"),
  },
];

export const addUsers = async () => {
  const importResult = await auth.importUsers(users, {
    hash: {
      algorithm: "HMAC_SHA256",
      key: Buffer.from("secretKey"),
    },
  });
  console.log(`Successful import count: ${importResult.successCount}`);
  console.log(`Failed import count: ${importResult.failureCount}`);
};

function generateRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const mockBandwidth = () => generateRandomNumber(1e6, 1e8);

const mockLatency = () => generateRandomNumber(2, 300);

const mockRawMeasurement = (): RawMeasurement => {
  return {
    timestamp: new Date().toISOString(),
    download: {
      bandwidth: mockBandwidth(),
    },
    upload: {
      bandwidth: mockBandwidth(),
    },
    ping: {
      latency: mockLatency(),
    },
  };
};

export const mockUpload = async (email: string = "user1@example.com") => {
  const user = users.find((u) => u.email == email);

  if (!user) throw new Error(`No user found with email: ${email}`);

  await uploadToBucket(user as any, mockRawMeasurement());
};

const main = async () => {
  await addUsers();
  await mockUpload("james.matthew.barr@gmail.com");
};

main();
