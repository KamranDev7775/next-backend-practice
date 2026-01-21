export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and symbol',
  MISSING_FIELDS: 'All fields are required',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_LOGGED_IN: 'User is not logged in',
  USER_ID_REQUIRED: 'User ID is required',
  SERVER_ERROR: 'Internal server error'
} as const;