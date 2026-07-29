export async function fetchGuardian(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("guardian_token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("guardian_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  return res.json();
}
