export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function errorResponse(status: number, message: string, issues?: unknown): Response {
  return json(status, { error: { message, ...(issues ? { issues } : {}) } });
}
