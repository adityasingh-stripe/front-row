import "server-only";

export function requirePresenter(request: Request): Response | null {
  const expected = process.env.FRONT_ROW_ADMIN_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV !== "production" || process.env.FRONT_ROW_LOCAL_STORE === "1") return null;
    return Response.json(
      { error: "Creator controls are not configured. Set FRONT_ROW_ADMIN_TOKEN." },
      { status: 503 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return Response.json({ error: "Unlock creator controls with the presenter key." }, { status: 401 });
  }
  return null;
}
