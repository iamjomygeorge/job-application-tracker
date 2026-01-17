const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiService {
  private async getHeaders(token?: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    token?: string
  ): Promise<T> {
    const headers = await this.getHeaders(token);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    // Handle empty responses (like DELETE)
    const text = await res.text();
    return text ? JSON.parse(text) : (null as T);
  }

  get<T>(endpoint: string, token: string) {
    return this.request<T>(endpoint, "GET", undefined, token);
  }

  post<T>(endpoint: string, body: unknown, token: string) {
    return this.request<T>(endpoint, "POST", body, token);
  }

  patch<T>(endpoint: string, body: unknown, token: string) {
    return this.request<T>(endpoint, "PATCH", body, token);
  }

  delete<T>(endpoint: string, token: string) {
    return this.request<T>(endpoint, "DELETE", undefined, token);
  }
}

export const api = new ApiService();
