export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : "The request could not be completed.");
  }
  return body as T;
}

export async function createComplaint(payload: Record<string, unknown>) {
  return apiJson<{ complaint: any }>("/api/complaints", { method: "POST", body: JSON.stringify(payload) });
}

export async function getComplaint(id: string) {
  return apiJson<{ complaint: any }>(`/api/complaints/${encodeURIComponent(id)}`);
}

export async function updateComplaint(id: string, payload: Record<string, unknown>) {
  return apiJson<{ complaint: any }>(`/api/complaints/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function addComment(id: string, comment: string) {
  return apiJson<{ complaint: any }>(`/api/complaints/${encodeURIComponent(id)}/comments`, { method: "POST", body: JSON.stringify({ comment }) });
}

export async function escalateComplaint(id: string, reason?: string) {
  return apiJson<{ complaint: any }>(`/api/complaints/${encodeURIComponent(id)}/escalate`, { method: "POST", body: JSON.stringify({ reason }) });
}

export async function getDashboard() {
  return apiJson<any>("/api/analytics/dashboard");
}

export async function createSafetyReport(payload: Record<string, unknown>) {
  return apiJson<{ report: any }>("/api/safety-reports", { method: "POST", body: JSON.stringify(payload) });
}
