const { Redis } = require("@upstash/redis");

module.exports = async function visitsHandler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return response.status(503).json({ error: "Visit counter is not configured" });
  }

  try {
    const databaseUrl = new URL(redisUrl);
    if (databaseUrl.protocol !== "https:") {
      return response.status(503).json({ error: "Visit counter is not configured" });
    }

    const redis = new Redis({
      url: databaseUrl.origin,
      token: redisToken
    });
    const visits = await redis.incr("va-joms:page-visits");

    if (!Number.isSafeInteger(visits) || visits < 1) {
      console.error("[visits] Upstash returned an invalid counter value");
      return response.status(502).json({ error: "Visit counter is unavailable" });
    }

    return response.status(200).json({ visits });
  } catch (error) {
    console.error("[visits] Upstash INCR failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message.slice(0, 160) : "Unknown error"
    });
    return response.status(502).json({ error: "Visit counter is unavailable" });
  }
};