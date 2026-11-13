import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

const userFields = {
    name: z.string().trim().min(1, "Le nom est obligatoire."),
    email: z.string().trim().email("L'adresse email est invalide."),
    password: z.string().min(1, "Le mot de passe est obligatoire."),
    role: z.enum(["super_admin", "admin"], {
        message: "Le rôle doit être super_admin ou admin.",
    }),
};

export const createUserSchema = z
    .object({
        ...userFields,
        role: userFields.role.optional(),
    })
    .strict();

export const updateUserSchema = z
    .object(userFields)
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        message: "Au moins un champ doit être fourni.",
    });

export const userIdParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/, "Identifiant invalide."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;

type Schema = z.ZodType;

const validate =
    (schema: Schema, source: "body" | "params"): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            return res.status(source === "body" ? 422 : 400).json({
                success: false,
                message: "Données de requête invalides.",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        if (source === "body") {
            req.body = result.data;
        } else {
            Object.assign(req.params, result.data);
        }
        next();
    };

export const validateCreateUser = validate(createUserSchema, "body");
export const validateUpdateUser = validate(updateUserSchema, "body");
export const validateUserId = validate(userIdParamsSchema, "params");
