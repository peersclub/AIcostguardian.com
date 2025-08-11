/**
 * Safe fetch wrapper that handles JSON parsing and errors
 */
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; ok: boolean }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    
    try {
      const text = await response.text();
      
      // Check if response is JSON
      if (contentType?.includes('application/json')) {
        data = text ? JSON.parse(text) : null;
      } else if (text.startsWith('{') || text.startsWith('[')) {
        // Try to parse as JSON even if content-type is wrong
        data = JSON.parse(text);
      } else {
        // Non-JSON response
        data = { error: text || 'Unexpected response format' };
      }
    } catch (parseError) {
      console.error('Response parsing error:', parseError);
      // If we can't parse it, treat it as an error
      data = { 
        error: `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error || data?.message || `Request failed with status ${response.status}`,
        data: undefined,
      };
    }

    return {
      ok: true,
      data,
      error: undefined,
    };
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network request failed',
      data: undefined,
    };
  }
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  url: string,
  body: any,
  options?: RequestInit
): Promise<{ data?: T; error?: string; ok: boolean }> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; ok: boolean }> {
  return apiFetch<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; ok: boolean }> {
  return apiFetch<T>(url, {
    ...options,
    method: 'DELETE',
  });
}