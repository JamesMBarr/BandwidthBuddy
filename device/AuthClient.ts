import { OAuth2Client } from "google-auth-library";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { backoff, fetchWrapper } from "@shared/utils";

const GOOGLE_AUTH_ROUTE = "https://oauth2.googleapis.com/";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  expires_in: number;
  interval: number;
  verification_url: URL;
}

interface AccessToken {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
}

interface RefreshToken extends AccessToken {
  refresh_token: string;
  expiry_date: number;
}

class AuthClient extends OAuth2Client {
  private static TOKEN_LOC = "./token.json";
  // TODO: after fetching the auth code
  deviceCode: string | null = null;
  private _token: RefreshToken | null = null;

  constructor(clientId: string, clientSecret: string) {
    super(clientId, clientSecret);
    super.addListener("tokens", (token) => {
      this.token = { ...this._token, ...token };
    });
  }

  static get doesTokenFileExist() {
    return existsSync(AuthClient.TOKEN_LOC);
  }

  async initialise() {
    if (!AuthClient.doesTokenFileExist) {
      await this.createOAuthToken();
    }

    super.setCredentials(this.token);
  }

  /**
   * Starts the OAuth 2.0 flow for limited-input device applications.
   * https://developers.google.com/identity/protocols/oauth2/limited-input-device
   *
   * After making the request for a device code, polls the token endpoint with
   * an exponentially increasing back off. Writes the token response to a file
   * synchronously
   */
  async createOAuthToken() {
    try {
      const content = await this.requestCodes();

      console.log("Go to the URL provided and enter the code: ", content);

      let token = await this.pollAuthServer();

      // calculate and append the expiry date
      token = {
        ...token,
        expiry_date: new Date().getTime() + token.expires_in,
      };

      this.token = token;

      super.setCredentials(token);
    } catch (error) {
      console.error("Error occurred trying to complete OAuth flow");
      throw error;
    }
  }

  get token(): RefreshToken {
    if (!AuthClient.doesTokenFileExist)
      throw new Error("Refresh token file does not exist");

    if (this._token === null) {
      const data = readFileSync(AuthClient.TOKEN_LOC, "utf8");
      this._token = JSON.parse(data);
    }

    return this._token!;
  }

  set token(token: RefreshToken) {
    this._token = token;

    writeFileSync(AuthClient.TOKEN_LOC, JSON.stringify(token));
  }

  private requestCodes = async () => {
    // request device and user codes
    const resp = await fetchWrapper(`${GOOGLE_AUTH_ROUTE}/device/code`, {
      method: "post",
      body: JSON.stringify({
        client_id: this._clientId,
        scope: "email",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const content = (await resp.json()) as DeviceCodeResponse;

    // set codes properties
    // TODO: stores this in a file for fromRefreshToken case
    this.deviceCode = content.device_code;

    return content;
  };

  private pollAuthServer = async () => {
    const pollCallback = () => {
      return fetchWrapper(`${GOOGLE_AUTH_ROUTE}/token`, {
        method: "post",
        body: JSON.stringify({
          client_id: this._clientId,
          client_secret: this._clientSecret,
          device_code: this.deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
        headers: { "Content-Type": "application/json" },
      });
    };

    const resp = await backoff(pollCallback, 5000);

    const token: RefreshToken = await resp.json();

    return token;
  };
}

export { AuthClient };
