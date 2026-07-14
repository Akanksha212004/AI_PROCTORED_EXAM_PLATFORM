// src/utils/ApiResponse.ts
//
// New utility (you didn't already have one) for successful responses,
// matching the { success, message, data } shape used across the API.
// Error responses continue to go through your existing ApiError class
// + global error middleware — this class is success-path only.

export class ApiResponse<T> {
  public readonly statusCode: number;
  public readonly data: T;
  public readonly message: string;
  public readonly success: boolean;

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
