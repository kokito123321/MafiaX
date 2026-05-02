import { AccessToken } from "livekit-server-sdk";

/** Validates env only when video/token routes run — avoids crashing the whole server at import time (e.g. missing Render env). */
function getLiveKitConfig(): {
  apiKey: string;
  apiSecret: string;
  url: string;
} {
  const apiKey = process.env["LIVEKIT_API_KEY"];
  const apiSecret = process.env["LIVEKIT_API_SECRET"];
  const url = process.env["LIVEKIT_URL"];
  if (!apiKey || !apiSecret || !url) {
    throw new Error(
      "LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET must all be set in the environment.",
    );
  }
  return { apiKey, apiSecret, url };
}

export function getLiveKitUrl(): string {
  return getLiveKitConfig().url;
}

export interface LiveKitTokenOpts {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean;
  canSubscribe: boolean;
}

export async function createLiveKitToken(opts: LiveKitTokenOpts): Promise<string> {
  const { apiKey, apiSecret } = getLiveKitConfig();
  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
    ttl: 60 * 60 * 6, // 6 hours
  });
  at.addGrant({
    room: opts.roomName,
    roomJoin: true,
    canPublish: opts.canPublish,
    canSubscribe: opts.canSubscribe,
    canPublishData: true,
  });
  return at.toJwt();
}
