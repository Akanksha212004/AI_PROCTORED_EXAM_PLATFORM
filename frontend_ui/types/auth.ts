export type UserRole = "STUDENT" | "EXAMINER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user: User;
}

export interface DecodedToken {
  sub: string;
  role: UserRole;
  email: string;
  exp: number;
  iat: number;
}

export interface ApiError {
  detail: string | { msg: string; loc: (string | number)[]; type: string }[];
}
