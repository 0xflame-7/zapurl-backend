import { ApiResponse } from '../types';

export function createApiResponse<T>(
  success: boolean,
  data: T,
  message?: string,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    error,
  };
}

export function print() {
  console.log('Hello, Daksh');
}
