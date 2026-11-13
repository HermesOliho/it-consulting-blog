import type User from "../models/user.model";
import type { UserDto } from "../types/user";

export const toUserDto = (user: User): UserDto => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
});
