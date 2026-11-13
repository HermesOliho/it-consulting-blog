import argon2 from "argon2";
import { Request, Response } from "express";
import { User } from "../models/index.model";
import { isValidId } from "../utils";
import { toUserDto } from "../mappers";
import type { UserRole } from "../models/user.model";
import type { ApiError, ApiResponse } from "../types/api";
import type { UserDto } from "../types/user";
import type {
    CreateUserInput,
    UpdateUserInput,
    UserIdParams,
} from "../validators/user.validator";

const userAttributes = [
    "id",
    "name",
    "email",
    "role",
    "createdAt",
    "updatedAt",
];

export const getAllUsers = async (
    req: Request<{}, ApiResponse<UserDto[]>>,
    res: Response<ApiResponse<UserDto[]>>,
) => {
    try {
        const users = await User.findAll({
            attributes: userAttributes,
        });
        return res.status(200).json({
            success: true,
            data: users.map(toUserDto),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des utilisateurs :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getUserById = async (
    req: Request<UserIdParams, ApiResponse<UserDto>>,
    res: Response<ApiResponse<UserDto>>,
) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const user = await User.findByPk(Number(id), {
            attributes: userAttributes,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé !",
            });
        }

        return res.status(200).json({
            success: true,
            data: toUserDto(user),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'utilisateur :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const createUser = async (
    req: Request<{}, ApiResponse<UserDto>, CreateUserInput>,
    res: Response<ApiResponse<UserDto>>,
) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({
            where: { email: email.trim() },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Cette adresse email est déjà utilisée.",
            });
        }

        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
        });
        const user = await User.create({
            name: name.trim(),
            email: email.trim(),
            password: hashedPassword,
            role: role ?? "admin",
        });

        return res.status(201).json({
            success: true,
            data: toUserDto(user),
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const updateUser = async (
    req: Request<UserIdParams, ApiResponse<UserDto>, UpdateUserInput>,
    res: Response<ApiResponse<UserDto>>,
) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const user = await User.findByPk(Number(id));

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé !",
            });
        }

        if (email !== undefined && email.trim() !== user.email) {
            const existingUser = await User.findOne({
                where: { email: email.trim() },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Cette adresse email est déjà utilisée.",
                });
            }
        }

        const updates: {
            name?: string;
            email?: string;
            password?: string;
            role?: UserRole;
        } = {};

        if (name !== undefined) updates.name = name.trim();
        if (email !== undefined) updates.email = email.trim();
        if (role !== undefined) updates.role = role;
        if (password !== undefined) {
            updates.password = await argon2.hash(password, {
                type: argon2.argon2id,
            });
        }

        await user.update(updates);

        return res.status(200).json({
            success: true,
            data: toUserDto(user),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la modification de l'utilisateur :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const deleteUser = async (
    req: Request<UserIdParams, ApiError>,
    res: Response<ApiError>,
) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const deletedCount = await User.destroy({ where: { id: Number(id) } });

        if (!deletedCount) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé !",
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error(
            "Erreur lors de la suppression de l'utilisateur :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};
