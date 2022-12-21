#!/usr/bin/node

import { execFile } from "node:child_process";
import { promisify } from "util";
import { checkEnvVar, checkEnvVarFile } from "../shared/env";
import { fetchWrapper } from "../shared/utils";
import { AuthClient } from "./AuthClient";

const execFileAsync = promisify(execFile);

// Location of the Ookla speedtest CLI
const EXECUTABLE_LOC = checkEnvVarFile("EXECUTABLE_LOC");
// OAuth client ID and client secret
const CLIENT_ID = checkEnvVar("CLIENT_ID");
const CLIENT_SECRET = checkEnvVar("CLIENT_SECRET");
// URL of the ingest endpoint
const URL = checkEnvVar("URL");

const main = async () => {
  console.log("Starting monitoring task");

  const client = new AuthClient(CLIENT_ID, CLIENT_SECRET);
  await client.initialise();

  // Executes internet speed test CLI
  const { stdout, stderr } = await execFileAsync(EXECUTABLE_LOC, [
    "--format",
    "json",
  ]);

  if (stderr) {
    console.error(stderr);
    process.exit(1);
  }

  console.log("Completed speedtest process");
  const result = JSON.parse(stdout);

  console.log("Posting data to endpoint");

  // refreshes the credentials is required
  await client.getAccessToken();

  const resp = await fetchWrapper(URL, {
    method: "POST",
    body: JSON.stringify(result),
    headers: {
      Authorization: `Bearer ${client.credentials.id_token}`,
      "Content-Type": "application/json",
    },
  });

  console.log(resp.status, resp.statusText);

  console.log("Done");
};

main();
