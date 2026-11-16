import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const postFields = {
    title: z.string().trim().min(1, "Le titre est obligatoire."),
    slug: z
        .string()
        .trim()
        .min(1, "Le slug est obligatoire.")
        .regex(
            slugRegex,
            "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets.",
        ),
    excerpt: z
        .union([z.string().trim(), z.null()])
        .optional()
        .transform((value) => (value === undefined ? undefined : value || null)),
    content: z.string().trim().min(1, "Le contenu est obligatoire."),
    coverImage: z
        .union([z.string().trim(), z.null()])
        .optional()
        .transform((value) => {
            if (value === undefined) return undefined;
            if (value === null) return null;
            return value === "" ? null : value;
        }),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    publishedAt: z
        .union([z.string().datetime(), z.null()])
        .optional()
        .transform((value) => (value === undefined ? undefined : value)),
    categoryId: z
        .union([z.coerce.number().int().positive(), z.null()])
        .optional(),
};

const normalizeBody = (body: any) => {
    if (!body || typeof body !== "object") return body;
    const normalized = { ...body };
    if (normalized.cover_image !== undefined && normalized.coverImage === undefined) {
        normalized.coverImage = normalized.cover_image;
    }
    if (normalized.category_id !== undefined && normalized.categoryId === undefined) {
        normalized.categoryId = normalized.category_id;
    }
    if (normalized.published_at !== undefined && normalized.publishedAt === undefined) {
        normalized.publishedAt = normalized.published_at;
    }
    delete normalized.cover_image;
    delete normalized.category_id;
    delete normalized.published_at;
    return normalized;
};

export const createPostSchema = z
    .preprocess(normalizeBody, z.object({
        title: postFields.title,
        slug: postFields.slug.optional(),
        excerpt: postFields.excerpt,
        content: postFields.content,
        coverImage: postFields.coverImage,
        status: postFields.status,
        publishedAt: postFields.publishedAt,
        categoryId: postFields.categoryId,
    }).strict());

export const updatePostSchema = z
    .preprocess(normalizeBody, z.object({
        title: postFields.title.optional(),
        slug: postFields.slug.optional(),
        excerpt: postFields.excerpt,
        content: postFields.content.optional(),
        coverImage: postFields.coverImage,
        status: postFields.status,
        publishedAt: postFields.publishedAt,
        categoryId: postFields.categoryId,
    }).strict())
    .refine((body) => Object.keys(body).length > 0, {
        message: "Au moins un champ doit être fourni.",
    });

export const postIdParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/, "Identifiant invalide."),
});

const sortFields = ["createdAt", "updatedAt", "publishedAt", "title", "status"] as const;

export const listPostsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().min(1).optional(),
    q: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    authorId: z.coerce.number().int().positive().optional(),
    sort: z.enum(sortFields).default("createdAt"),
    sortBy: z.enum(sortFields).optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostIdParams = z.infer<typeof postIdParamsSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

type Schema = z.ZodType;

const validate =
    (schema: Schema, source: "body" | "params" | "query"): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const status = source === "params" ? 400 : 422;
            return res.status(status).json({
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
        } else if (source === "query") {
            (req as any).validatedQuery = result.data;
        } else {
            Object.assign(req.params, result.data);
        }
        next();
    };

export const validateCreatePost = validate(createPostSchema, "body");
export const validateUpdatePost = validate(updatePostSchema, "body");
export const validatePostId = validate(postIdParamsSchema, "params");
export const validateListPostsQuery = validate(listPostsQuerySchema, "query");
