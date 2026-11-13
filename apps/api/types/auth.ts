import type { JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../models/user.model";
import type { LoginInput } from "../validators/auth.validator";
import type { UserDto } from "./user";

export type LoginRequest = LoginInput;

export interface AuthTokenPayload extends JwtPayload {
    sub: string;
    email: string;
    role?: UserRole;
}

export interface LoginResponse {
    user: UserDto;
    token: string;
    tokenType: "Bearer";
    expiresIn: number;
}
