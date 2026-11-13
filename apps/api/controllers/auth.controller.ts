import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JWT_SECRET } from "../config/env";
import { User } from "../models/index.model";
import { toUserDto } from "../mappers";
import type { ApiMessage, ApiResponse } from "../types/api";
import type { LoginRequest, LoginResponse } from "../types/auth";

const jwtSecret = JWT_SECRET;

if (!jwtSecret) {
    throw new Error(
        "Veuillez définir JWT_SECRET dans les variables d'environnement.",
    );
}

export const login = async (
    req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>,
    res: Response<ApiResponse<LoginResponse>>,
) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: { email },
        });

        if (!user || !(await argon2.verify(user.password, password))) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect.",
            });
        }

        const userId = String(user.id);
        const token = jwt.sign(
            {
                sub: userId,
                email: user.email,
                role: user.role,
            },
            jwtSecret,
            {
                algorithm: "HS256",
                expiresIn: 3600,
            },
        );

        return res.status(200).json({
            success: true,
            data: {
                user: toUserDto(user),
                token,
                tokenType: "Bearer",
                expiresIn: 3600,
            },
        });
    } catch (error) {
        console.error("Erreur lors de l'authentification :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const logout = (req: Request, res: Response<ApiMessage>) => {
    return res.status(200).json({
        success: true,
        message:
            "Déconnexion confirmée. Supprimez le token côté client ; il restera valide jusqu'à son expiration.",
    });
};
