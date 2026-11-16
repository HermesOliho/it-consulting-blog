import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categoryFields = {
    name: z.string().trim().min(1, "Le nom est obligatoire."),
    slug: z
        .string()
        .trim()
        .min(1, "Le slug est obligatoire.")
        .regex(
            slugRegex,
            "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets.",
        ),
    description: z
        .union([z.string().trim(), z.null()])
        .optional()
        .transform((value) => (value === undefined ? undefined : value || null)),
};

export const createCategorySchema = z
    .object({
        name: categoryFields.name,
        slug: categoryFields.slug.optional(),
        description: categoryFields.description,
    })
    .strict();

export const updateCategorySchema = z
    .object({
        name: categoryFields.name.optional(),
        slug: categoryFields.slug.optional(),
        description: categoryFields.description,
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        message: "Au moins un champ doit être fourni.",
    });

export const categoryIdParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/, "Identifiant invalide."),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;

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

export const validateCreateCategory = validate(createCategorySchema, "body");
export const validateUpdateCategory = validate(updateCategorySchema, "body");
export const validateCategoryId = validate(categoryIdParamsSchema, "params");
