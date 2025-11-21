// API Utilities - Retry Logic and Error Handling
// Provides retry mechanism with exponential backoff and Vietnamese error messages

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

interface ApiError {
  code: string;
  message: string;
  messageVi: string;
  statusCode?: number;
}

// Vietnamese error messages mapping
const ERROR_MESSAGES_VI: Record<string, string> = {
  'functions/unauthenticated': 'Bạn chưa được xác thực. Vui lòng đăng nhập lại.',
  'functions/permission-denied': 'Bạn không có quyền truy cập tài nguyên này.',
  'functions/not-found': 'Không tìm thấy tài nguyên yêu cầu.',
  'functions/invalid-argument': 'Tham số không hợp lệ.',
  'functions/deadline-exceeded': 'Yêu cầu vượt quá thời gian chờ. Vui lòng thử lại.',
  'functions/internal': 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
  'functions/unavailable': 'Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.',
  'functions/data-loss': 'Mất dữ liệu trong quá trình xử lý. Vui lòng liên hệ hỗ trợ.',
  'network-error': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  'timeout': 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.',
};

// Parse Firebase/Functions error code
function parseErrorCode(error: any): string {
  if (error?.code) return error.code;
  if (error?.message?.includes('unauthenticated')) return 'functions/unauthenticated';
  if (error?.message?.includes('permission')) return 'functions/permission-denied';
  if (error?.message?.includes('not found')) return 'functions/not-found';
  return 'functions/internal';
}

// Get Vietnamese error message
export function getVietnameseErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES_VI[errorCode] || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

// Sleep function for delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
  } = options;

  let lastError: any;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorCode = parseErrorCode(error);

      // Don't retry for authentication or permission errors
      if (
        errorCode === 'functions/unauthenticated' ||
        errorCode === 'functions/permission-denied' ||
        errorCode === 'functions/invalid-argument' ||
        errorCode === 'functions/not-found'
      ) {
        throw createApiError(errorCode, error);
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw createApiError(errorCode, error);
      }

      // Wait before retrying with exponential backoff
      await sleep(delayMs);
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    }
  }

  throw createApiError('functions/internal', lastError);
}

// Create standardized API error
function createApiError(code: string, originalError: any): ApiError {
  return {
    code,
    message: originalError?.message || 'An error occurred',
    messageVi: getVietnameseErrorMessage(code),
    statusCode: originalError?.statusCode,
  };
}

// Export error utilities
export { ApiError, RetryOptions, createApiError };
