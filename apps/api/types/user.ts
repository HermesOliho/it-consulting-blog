import type { UserRole } from "../models/user.model";

export interface UserDto {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}
