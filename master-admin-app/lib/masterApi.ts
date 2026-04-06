const API_BASE = process.env.MASTER_API_BASE_URL;
const API_TOKEN = process.env.MASTER_API_TOKEN;

function buildUrl(path: string): string {
     if (!API_BASE) {
          throw new Error("MASTER_API_BASE_URL is not set");
     }
     const trimmedBase = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
     const trimmedPath = path.startsWith("/") ? path.slice(1) : path;
     return `${trimmedBase}/${trimmedPath}`;
}

export async function masterApi(path: string, init?: RequestInit) {
     const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(init?.headers as Record<string, string>),
     };

     if (API_TOKEN) {
          headers.Authorization = `Bearer ${API_TOKEN}`;
     }

     const response = await fetch(buildUrl(path), {
          ...init,
          headers,
          cache: "no-store",
     });

     const text = await response.text();
     let data: unknown = null;
     try {
          data = text ? JSON.parse(text) : null;
     } catch {
          data = text;
     }

     return {
          ok: response.ok,
          status: response.status,
          data,
     };
}
