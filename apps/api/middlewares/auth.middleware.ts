import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

const jwtSecret = JWT_SECRET;

if (!jwtSecret) {
    throw new Error(
        "Veuillez définir JWT_SECRET dans les variables d'environnement.",
    );
}

export type AuthTokenPayload = JwtPayload & {
    sub: string;
    email: string;
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

        if (
            typeof payload === "string" ||
            typeof payload.sub !== "string" ||
            typeof payload.email !== "string"
        ) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification invalide.",
            });
        }

        res.locals.auth = payload as AuthTokenPayload;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token d'authentification expiré ou invalide.",
        });
    }
};
