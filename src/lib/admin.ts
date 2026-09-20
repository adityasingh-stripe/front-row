import "server-only";

export function requireCreatorWorkspace(request: Request): Response | null {
  if (process.env.FRONT_ROW_PUBLIC_DEMO === "1") return null;

  const expected = process.env.FRONT_ROW_ADMIN_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV !== "production" || process.env.FRONT_ROW_LOCAL_STORE === "1") return null;
    return Response.json(
      { error: "Creator workspace access is not configured. Set FRONT_ROW_ADMIN_TOKEN." },
      { status: 503 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return Response.json({ error: "That workspace key is not recognised." }, { status: 401 });
  }
  return null;
}
