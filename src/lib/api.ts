const API_URL = import.meta.env.VITE_API_URL;

// Store token in memory (or you can use localStorage if you want persistence)
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem("authToken", token); // Optional: persist token
}

export function getAuthToken() {
  return authToken || localStorage.getItem("authToken");
}

async function request(method: string, endpoint: string, data?: any) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const options: RequestInit = {
    method,
    headers,
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error("API error: " + response.statusText);
  }
  return response.json();
}

export function get(endpoint: string) {
  return request("GET", endpoint);
}

export function post(endpoint: string, data?: any) {
  return request("POST", endpoint, data);
}

export function put(endpoint: string, data?: any) {
  return request("PUT", endpoint, data);
}

export function del(endpoint: string) {
  return request("DELETE", endpoint);
}

// Login API (does not use auth token)
export async function loginUser(loginname: string, password: string) {
  const response = await fetch(`${API_URL}api/auth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loginname, password }),
  });
  if (!response.ok) {
    throw new Error("Login failed: " + response.statusText);
  }
  const data = await response.json();
  setAuthToken(data.access); // Save token for future requests
  return data;
}