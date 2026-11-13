import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

const contentField = z
    .string()
    .trim()
    .min(1, "Le contenu est obligatoire.")
    .max(5000, "Le contenu ne peut pas dépasser 5000 caractères.");

export const createGuestCommentSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Le nom est obligatoire.")
            .max(100, "Le nom ne peut pas dépasser 100 caractères."),
        email: z
            .string()
            .trim()
            .email("L'adresse email est invalide.")
            .max(150, "L'email ne peut pas dépasser 150 caractères."),
        content: contentField,
    })
    .strict();

export const createMemberCommentSchema = z
    .object({
        content: contentField,
    })
    .strict();

export const updateCommentSchema = z
    .object({
        approved: z.boolean({
            message: "Le champ approved doit être un booléen.",
        }),
    })
    .strict();

export const commentIdParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/, "Identifiant invalide."),
});

export const commentPostIdParamsSchema = z.object({
    postId: z.string().regex(/^[1-9]\d*$/, "Identifiant invalide."),
});

export const commentListQuerySchema = z
    .object({
        postId: z
            .string()
            .regex(/^[1-9]\d*$/, "Identifiant d'article invalide.")
            .optional(),
        approved: z
            .enum(["true", "false"], {
                message: "Le filtre approved doit valoir true ou false.",
            })
            .optional(),
    })
    .strict();

type Schema = z.ZodType;

const validate =
    (schema: Schema, source: "body" | "params" | "query"): RequestHandler =>
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
        } else if (source === "params") {
            Object.assign(req.params, result.data);
        }
        // Pour la query, la validation suffit : le contrôleur relit les valeurs
        // brutes, car req.query est un getter non persistant dans Express 5.
        next();
    };

export const validateCreateGuestComment = validate(
    createGuestCommentSchema,
    "body",
);
export const validateCreateMemberComment = validate(
    createMemberCommentSchema,
    "body",
);
export const validateUpdateComment = validate(updateCommentSchema, "body");
export const validateCommentId = validate(commentIdParamsSchema, "params");
export const validateCommentPostId = validate(
    commentPostIdParamsSchema,
    "params",
);
export const validateCommentListQuery = validate(
    commentListQuerySchema,
    "query",
);
