/**
 * Equivalent of FastAPI's `HTTPException`. Throw this from anywhere
 * (services, controllers) and the global error middleware converts it
 * into a `{ detail: ... }` JSON response with the right status code.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }
  static unauthorized(message = "Could not validate credentials") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }
}
