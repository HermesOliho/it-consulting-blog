import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

export const loginSchema = z
    .object({
        email: z.string().trim().email("L'adresse email est invalide."),
        password: z.string().min(1, "Le mot de passe est obligatoire."),
    })
    .strict();

export const validateLogin: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            success: false,
            message: "Données de connexion invalides.",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    req.body = result.data;
    next();
};
