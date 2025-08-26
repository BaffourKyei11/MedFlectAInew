import { QueryClient, QueryFunction, QueryKey } from "@tanstack/react-query";

// Custom error types for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public url: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Enhanced error handling function
async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    let errorData: any;
    
    try {
      errorData = await res.json();
    } catch {
      // If response can't be parsed as JSON, use status text
      errorData = { message: res.statusText };
    }

    // Categorize errors based on status code
    if (res.status >= 400 && res.status < 500) {
      if (res.status === 401) {
        throw new APIError(
          'Authentication required. Please log in again.',
          res.status,
          res.statusText,
          res.url,
          errorData
        );
      } else if (res.status === 403) {
        throw new APIError(
          'Access denied. You do not have permission to perform this action.',
          res.status,
          res.statusText,
          res.url,
          errorData
        );
      } else if (res.status === 404) {
        throw new APIError(
          'Resource not found. The requested data could not be located.',
          res.status,
          res.statusText,
          res.url,
          errorData
        );
      } else if (res.status === 422) {
        throw new ValidationError(
          errorData.message || 'Validation failed. Please check your input.',
          errorData.field,
          errorData.value
        );
      } else {
        throw new APIError(
          errorData.message || `Request failed with status ${res.status}`,
          res.status,
          res.statusText,
          res.url,
          errorData
        );
      }
    } else if (res.status >= 500) {
      throw new APIError(
        'Server error. Please try again later or contact support.',
        res.status,
        res.statusText,
        res.url,
        errorData
      );
    }
  }
}

// Enhanced API request function with retry logic
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
  }
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, timeout = 30000 } = options || {};
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      await throwIfResNotOk(res);
      return res;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Don't retry on network errors that aren't retryable
      if (error instanceof NetworkError && error.message.includes('aborted')) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw lastError!;
}

// Enhanced query function with better error handling
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  retries?: number;
  retryDelay?: number;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, retries = 3, retryDelay = 1000 }) =>
  async ({ queryKey }) => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(queryKey.join("/") as string, {
          credentials: "include",
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        await throwIfResNotOk(res);
        return await res.json();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    throw lastError!;
  };

// Enhanced query client with better defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry queries on client errors
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          return false;
        }
        
        // Don't retry on validation errors
        if (error instanceof ValidationError) {
          return false;
        }
        
        // Retry up to 3 times for server errors and network issues
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          return false;
        }
        
        // Don't retry on validation errors
        if (error instanceof ValidationError) {
          return false;
        }
        
        // Retry up to 2 times for server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Utility function to handle errors in components
export function handleQueryError(error: unknown): {
  title: string;
  message: string;
  isRetryable: boolean;
  status?: number;
} {
  if (error instanceof APIError) {
    return {
      title: 'Request Failed',
      message: error.message,
      isRetryable: error.status >= 500,
      status: error.status,
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      title: 'Validation Error',
      message: error.message,
      isRetryable: false,
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      title: 'Network Error',
      message: 'Please check your internet connection and try again.',
      isRetryable: true,
    };
  }
  
  if (error instanceof Error) {
    return {
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred.',
      isRetryable: true,
    };
  }
  
  return {
    title: 'Unknown Error',
    message: 'An unknown error occurred. Please try again.',
    isRetryable: true,
  };
}
