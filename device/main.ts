#!/usr/bin/node

import { existsSync, writeFileSync } from "fs";
import { execFile } from "node:child_process";
import { promisify } from "util";
import fetch from "node-fetch";
import { checkEnvVar, checkEnvVarFile } from "../shared/env";
import { backoff, fetchWrapper } from "../shared/utils";

const execFileAsync = promisify(execFile);

// Location of the Ookla speedtest CLI
const EXECUTABLE_LOC = checkEnvVarFile("EXECUTABLE_LOC");
// OAuth client ID and client secret
const CLIENT_ID = checkEnvVar("CLIENT_ID");
const CLIENT_SECRET = checkEnvVar("CLIENT_SECRET");
const GOOGLE_AUTH_ROUTE = "https://oauth2.googleapis.com/";
// Location of the auth token
const TOKEN_LOC = "./token.json";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  expires_in: number;
  interval: number;
  verification_url: URL;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
}

/**
 * Starts the OAuth 2.0 flow for limited-input device applications.
 * https://developers.google.com/identity/protocols/oauth2/limited-input-device
 *
 * After making the request for a device code, polls the token endpoint with an
 * exponentially increasing back off. Writes the token response to a file
 * synchronously
 *
 * TODO: build in the refresh token logic and retry?
 */
const auth = async () => {
  const deviceResp = await fetch(`${GOOGLE_AUTH_ROUTE}/device/code`, {
    method: "post",
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: "email",
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (!deviceResp.ok)
    throw new Error(`Unsuccessful auth request: ${await deviceResp.text()}`);

  const content = (await deviceResp.json()) as DeviceCodeResponse;

  console.log("Go to the URL provided and enter the code: ", content);

  const pollCallback = () => {
    return fetchWrapper(`${GOOGLE_AUTH_ROUTE}/token`, {
      method: "post",
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        device_code: content.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const tokenResp = await backoff(pollCallback, 5000);
  const tokenContent: TokenResponse = await tokenResp.json();

  writeFileSync(
    TOKEN_LOC,
    JSON.stringify({ ...tokenContent, client_id: CLIENT_ID })
  );
};

const main = async () => {
  console.log("Starting monitoring task");

  if (!existsSync(TOKEN_LOC)) await auth();

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

  console.log("TODO: POST data to endpoint", result);

  console.log("Done");
};

main();
