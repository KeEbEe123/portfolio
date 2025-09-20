// app/api/spotify/recent/route.ts
import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const RECENT_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

function log(msg: string, meta: Record<string, unknown> = {}) {
  // Centralized logger; never log secrets
  console.log(`[SpotifyRecent] ${msg}`, meta);
}

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;

  const missing = [
    !clientId && "SPOTIFY_CLIENT_ID",
    !clientSecret && "SPOTIFY_CLIENT_SECRET",
    !refresh && "SPOTIFY_REFRESH_TOKEN",
  ].filter(Boolean) as string[];

  if (missing.length) {
    log("Missing required env vars", { missing });
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const start = Date.now();
  log("Requesting Spotify access token");
  let res: Response | undefined;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh!,
      }),
      cache: "no-store",
    });
  } catch (err: any) {
    log("Token fetch threw", { error: err?.message });
    throw err;
  }

  const durationMs = Date.now() - start;
  log("Token response", { status: res.status, durationMs });

  if (!res.ok) {
    const text = await res.text();
    log("Token response not ok", { status: res.status, bodyPreview: text.slice(0, 200) });
    throw new Error(`Token error: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string };
  if (!data?.access_token) {
    log("Missing access_token in token response");
    throw new Error("Invalid token response");
  }
  return data.access_token;
}

export async function GET() {
  const start = Date.now();
  log("GET /api/spotify/recent start");
  try {
    const access = await getAccessToken();
    log("Access token acquired");

    const apiStart = Date.now();
    const r = await fetch(RECENT_URL, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    const apiDurationMs = Date.now() - apiStart;
    log("Spotify recent response", { status: r.status, durationMs: apiDurationMs });

    if (!r.ok) {
      const text = await r.text();
      log("Recent not ok", { status: r.status, bodyPreview: text.slice(0, 200) });
      throw new Error(`Recent error: ${r.status}`);
    }

    const json = await r.json();
    const itemsLen = Array.isArray(json?.items) ? json.items.length : 0;
    log("Parsed recent JSON", { itemsLen });

    // Defensive parsing against the sample structure
    const item = json?.items?.[0];
    const track = item?.track;
    const playedAt = item?.played_at ?? null;

    const trackName: string = track?.name ?? "";
    const artistName: string = (track?.artists ?? [])
      .map((a: any) => a?.name)
      .filter(Boolean)
      .join(", ");
    const imageUrl: string = track?.album?.images?.[0]?.url ?? "";
    const trackUrl: string = track?.external_urls?.spotify ?? "";

    const totalMs = Date.now() - start;
    log("GET /api/spotify/recent success", { totalMs });
    return NextResponse.json(
      { trackName, artistName, imageUrl, trackUrl, playedAt },
      { status: 200 }
    );
  } catch (e: any) {
    const totalMs = Date.now() - start;
    log("GET /api/spotify/recent error", { totalMs, error: e?.message, stack: e?.stack?.slice?.(0, 500) });
    return NextResponse.json(
      { error: true, message: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
