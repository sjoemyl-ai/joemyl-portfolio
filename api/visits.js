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

    const key = encodeURIComponent("va-joms:page-visits");
    const upstream = await fetch(`${databaseUrl.origin}/incr/${key}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${redisToken}`
      },
      signal: AbortSignal.timeout(5000)
    });
    const payload = await upstream.json();
    const visits = Number(payload.result);

    if (!upstream.ok || payload.error || !Number.isSafeInteger(visits) || visits < 1) {
      return response.status(502).json({ error: "Visit counter is unavailable" });
    }

    return response.status(200).json({ visits });
  } catch {
    return response.status(502).json({ error: "Visit counter is unavailable" });
  }
};