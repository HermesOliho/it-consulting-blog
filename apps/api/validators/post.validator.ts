import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

const postFields = {
    title: z.string().trim().min(1, "Le titre est obligatoire."),
    slug: z
        .string()
        .trim()
        .min(1, "Le slug est obligatoire.")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets.",
        ),
    content: z.string().trim().min(1, "Le contenu est obligatoire."),
};

export const createPostSchema = z
    .object({
        ...postFields,
        slug: postFields.slug.optional(),
    })
    .strict();

export const updatePostSchema = z
    .object(postFields)
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        message: "Au moins un champ doit être fourni.",
    });

export const postIdParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/, "Identifiant invalide."),
});

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

export const validateCreatePost = validate(createPostSchema, "body");
export const validateUpdatePost = validate(updatePostSchema, "body");
export const validatePostId = validate(postIdParamsSchema, "params");
