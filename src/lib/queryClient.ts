import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status} ${res.statusText}`, {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      text
    });
    throw new Error(`${res.status}: ${text}`);
  }
}

function getFullUrl(url: string): string {
  // If URL already includes the base URL, return as is
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Incoming URL:', url);
  
  if (url.startsWith('http')) {
    console.log('URL already has protocol, using as-is:', url);
    return url;
  }
  // Otherwise, prepend the API base URL
  const fullUrl = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  console.log(`API Request: ${fullUrl}`);
  return fullUrl;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = getFullUrl(url);
  
  console.log(`Making ${method} request to:`, fullUrl);
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // Remove credentials since JWT is disabled
      // credentials: "include",
    });

    console.log(`Response status: ${res.status} for ${fullUrl}`);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Failed to fetch ${fullUrl}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = getFullUrl(queryKey[0] as string);
    
    console.log(`Query function fetching:`, fullUrl);
    
    try {
      const res = await fetch(fullUrl, {
        // Remove credentials since JWT is disabled
        // credentials: "include",
      });

      console.log(`Query response status: ${res.status} for ${fullUrl}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Query data received:`, data);
      return data;
    } catch (error) {
      console.error(`Query failed for ${fullUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
}); 