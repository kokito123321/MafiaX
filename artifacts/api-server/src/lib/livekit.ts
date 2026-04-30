import { AccessToken } from "livekit-server-sdk";

const apiKey = process.env["LIVEKIT_API_KEY"];
const apiSecret = process.env["LIVEKIT_API_SECRET"];
export const livekitUrl = process.env["LIVEKIT_URL"];

if (!apiKey || !apiSecret || !livekitUrl) {
  throw new Error(
    "LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET must all be set in the environment.",
  );
}

export interface LiveKitTokenOpts {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean;
  canSubscribe: boolean;
}

export async function createLiveKitToken(opts: LiveKitTokenOpts): Promise<string> {
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
