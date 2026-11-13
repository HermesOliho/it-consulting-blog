import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { User } from "../models/index.model";
import type { UserRole } from "../models/user.model";
import type { AuthTokenPayload } from "../types/auth";

const jwtSecret = JWT_SECRET;

if (!jwtSecret) {
    throw new Error(
        "Veuillez définir JWT_SECRET dans les variables d'environnement.",
    );
}

const isAuthTokenPayload = (
    payload: string | JwtPayload,
): payload is AuthTokenPayload => {
    if (typeof payload === "string") {
        return false;
    }

    return (
        typeof payload.sub === "string" &&
        typeof payload.email === "string" &&
        (payload.role === undefined ||
            payload.role === "super_admin" ||
            payload.role === "admin")
    );
};

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authorization = req.headers.authorization;
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Token d'authentification manquant ou invalide.",
        });
    }

    try {
        const payload = jwt.verify(token, jwtSecret);

        if (!isAuthTokenPayload(payload)) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification invalide.",
            });
        }

        res.locals.auth = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token d'authentification expiré ou invalide.",
        });
    }
};

/**
 * Restreint l'accès à une ou plusieurs rôles.
 * Le rôle est relu en base à chaque requête : une modification de rôle ou la
 * suppression d'un utilisateur prend donc effet immédiatement, sans attendre
 * l'expiration du JWT.
 * À utiliser après requireAuth.
 */
export const requireRole =
    (...allowedRoles: UserRole[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auth = res.locals.auth;
            const userId = Number(auth?.sub);

            if (!auth || !Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    success: false,
                    message: "Utilisateur authentifié invalide.",
                });
            }

            const user = await User.findByPk(userId, {
                attributes: ["id", "role"],
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Utilisateur authentifié introuvable.",
                });
            }

            const role = user.role;

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: "Accès refusé. Permissions insuffisantes.",
                });
            }

            res.locals.auth = { ...auth, role };
            next();
        } catch (error) {
            console.error(
                "Erreur lors de la vérification du rôle :",
                error,
            );
            return res.status(500).json({
                success: false,
                message: "Erreur serveur !",
            });
        }
    };
