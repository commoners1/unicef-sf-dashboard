/**
 * Extracts a user-friendly error message from various error types
 * 
 * @param error - Error object, string, or unknown type
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred'
): string {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return defaultMessage;
}

/**
 * Extracts error message from API response
 * 
 * @param error - Axios error or other API error
 * @returns User-friendly error message
 */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    // Axios error structure
    if ('response' in error) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
      if (axiosError.response?.status === 401) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      if (axiosError.response?.status === 403) {
        return 'Access denied. Please contact your administrator for access.';
      }
      if (axiosError.response?.status === 429) {
        return 'Too many requests. Please wait a few minutes before trying again.';
      }
      if (axiosError.response?.status && axiosError.response.status >= 500) {
        return 'Server temporarily unavailable. Please try again later.';
      }
    }
    // Network error
    if ('message' in error && String(error.message).includes('Network')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
  }
  return getErrorMessage(error, 'An unexpected error occurred');
}

