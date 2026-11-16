import { Op } from "sequelize";
import { Request, Response } from "express";
import { Category, Post, User } from "../models/index.model";
import { toPostDto } from "../mappers";
import { isValidId } from "../utils";
import type { ApiError, ApiPaginated, ApiResponse } from "../types/api";
import type { PostDto } from "../types/post";
import type {
    CreatePostInput,
    ListPostsQuery,
    PostIdParams,
    UpdatePostInput,
} from "../validators/post.validator";

const postAttributes = [
    "id",
    "title",
    "slug",
    "excerpt",
    "content",
    "coverImage",
    "status",
    "publishedAt",
    "authorId",
    "categoryId",
    "createdAt",
    "updatedAt",
];

const postQueryOptions = {
    attributes: postAttributes,
    include: [
        {
            model: User,
            as: "author",
            attributes: ["id", "name"],
        },
        {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug", "description", "createdAt", "updatedAt"],
        },
    ],
};

const getPostId = (id: string | string[]) => (isValidId(id) ? Number(id) : null);

const slugify = (title: string) =>
    title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "article";

const getAvailableSlug = async (title: string, ignoreId?: number) => {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        const existing = await Post.findOne({ where: { slug } });
        if (!existing || (ignoreId && existing.id === ignoreId)) {
            return slug;
        }
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
};

const isAdminRoute = (req: Request) => req.baseUrl.startsWith("/api/admin");

const parsePublishedAt = (value: string | null | undefined) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const buildWhere = async (req: Request, query: ListPostsQuery) => {
    const where: any = {};
    const admin = isAdminRoute(req);

    if (admin) {
        if (query.status) where.status = query.status;
        if (query.authorId) where.authorId = query.authorId;
    } else {
        where.status = "PUBLISHED";
    }

    const search = (query.search ?? query.q)?.trim();
    if (search) {
        const like = { [Op.like]: `%${search}%` };
        where[Op.or] = [
            { title: like },
            { content: like },
            { excerpt: like },
            { slug: like },
        ];
    }

    if (query.categoryId) {
        where.categoryId = query.categoryId;
    } else if (query.category) {
        const byId = Number(query.category);
        if (Number.isInteger(byId) && byId > 0) {
            where.categoryId = byId;
        } else {
            const category = await Category.findOne({
                where: { slug: query.category },
                attributes: ["id"],
            });
            if (!category) {
                return { where: null, empty: true } as const;
            }
            where.categoryId = category.id;
        }
    }

    return { where, empty: false } as const;
};

export const getAllPosts = async (
    req: Request,
    res: Response<ApiPaginated<PostDto> | ApiResponse<PostDto[]>>,
) => {
    try {
        const query = ((req as any).validatedQuery ?? {}) as ListPostsQuery;
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const offset = (page - 1) * limit;
        const sort = query.sortBy ?? query.sort ?? "createdAt";
        const order = (query.order ?? "desc").toUpperCase() as "ASC" | "DESC";

        const { where, empty } = await buildWhere(req, query);
        if (empty || !where) {
            return res.status(200).json({
                success: true,
                data: [],
                meta: { total: 0, page, limit, totalPages: 0 },
            });
        }

        const result = await Post.findAndCountAll({
            ...postQueryOptions,
            where,
            order: [[sort, order]],
            limit,
            offset,
            distinct: true,
        });

        const total = Array.isArray((result as any).count)
            ? (result as any).count.length
            : Number((result as any).count ?? 0);
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: result.rows.map(toPostDto),
            meta: { total, page, limit, totalPages },
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des articles :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getPostById = async (
    req: Request<PostIdParams, ApiResponse<PostDto>>,
    res: Response<ApiResponse<PostDto>>,
) => {
    try {
        const postId = getPostId(req.params.id);
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const post = await Post.findByPk(postId, postQueryOptions);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        if (!isAdminRoute(req) && post.status !== "PUBLISHED") {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        return res.status(200).json({
            success: true,
            data: toPostDto(post),
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

const ensureCategoryExists = async (categoryId: number | null | undefined) => {
    if (categoryId == null) return null;
    const category = await Category.findByPk(categoryId, { attributes: ["id"] });
    return category;
};

export const createPost = async (
    req: Request<{}, ApiResponse<PostDto>, CreatePostInput>,
    res: Response<ApiResponse<PostDto>>,
) => {
    try {
        const authorId = Number(res.locals.auth?.sub);
        if (!Number.isInteger(authorId) || authorId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Utilisateur authentifié invalide.",
            });
        }

        const { title, content } = req.body;
        const slug = req.body.slug ?? (await getAvailableSlug(title));
        const existingPost = await Post.findOne({ where: { slug } });
        if (existingPost) {
            return res.status(409).json({
                success: false,
                message: "Ce slug est déjà utilisé.",
            });
        }

        if (req.body.categoryId !== undefined && req.body.categoryId !== null) {
            const category = await ensureCategoryExists(req.body.categoryId);
            if (!category) {
                return res.status(422).json({
                    success: false,
                    message: "Catégorie introuvable.",
                });
            }
        }

        const status = req.body.status ?? "DRAFT";
        let publishedAt = parsePublishedAt(req.body.publishedAt as any);
        if (status === "PUBLISHED" && !publishedAt) {
            publishedAt = new Date();
        }
        if (status === "DRAFT" && req.body.publishedAt === undefined) {
            publishedAt = null;
        }

        const post = await Post.create({
            title,
            slug,
            excerpt: req.body.excerpt ?? null,
            content,
            coverImage: req.body.coverImage ?? null,
            status,
            publishedAt: publishedAt ?? null,
            authorId,
            categoryId: req.body.categoryId ?? null,
        });

        const createdPost = await Post.findByPk(post.id, postQueryOptions);
        if (!createdPost) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur !",
            });
        }

        return res.status(201).json({
            success: true,
            data: toPostDto(createdPost),
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const updatePost = async (
    req: Request<PostIdParams, ApiResponse<PostDto>, UpdatePostInput>,
    res: Response<ApiResponse<PostDto>>,
) => {
    try {
        const postId = getPostId(req.params.id);
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        if (req.body.slug !== undefined && req.body.slug !== post.slug) {
            const existingPost = await Post.findOne({ where: { slug: req.body.slug } });
            if (existingPost && existingPost.id !== post.id) {
                return res.status(409).json({
                    success: false,
                    message: "Ce slug est déjà utilisé.",
                });
            }
        }

        if (req.body.categoryId !== undefined && req.body.categoryId !== null) {
            const category = await ensureCategoryExists(req.body.categoryId);
            if (!category) {
                return res.status(422).json({
                    success: false,
                    message: "Catégorie introuvable.",
                });
            }
        }

        const nextStatus = req.body.status ?? post.status;
        let nextPublishedAt = post.publishedAt;
        if (req.body.publishedAt !== undefined) {
            nextPublishedAt = parsePublishedAt(req.body.publishedAt as any) as any;
        }
        if (nextStatus === "PUBLISHED" && !nextPublishedAt) {
            nextPublishedAt = new Date();
        }
        if (nextStatus === "DRAFT" && req.body.status === "DRAFT" && req.body.publishedAt === undefined) {
            nextPublishedAt = null;
        }

        await post.update({
            title: req.body.title ?? post.title,
            slug: req.body.slug ?? post.slug,
            excerpt:
                req.body.excerpt !== undefined ? req.body.excerpt : post.excerpt,
            content: req.body.content ?? post.content,
            coverImage:
                req.body.coverImage !== undefined
                    ? req.body.coverImage
                    : post.coverImage,
            status: nextStatus,
            publishedAt: nextPublishedAt,
            categoryId:
                req.body.categoryId !== undefined
                    ? req.body.categoryId
                    : post.categoryId,
        });

        const updatedPost = await Post.findByPk(postId, postQueryOptions);
        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        return res.status(200).json({
            success: true,
            data: toPostDto(updatedPost),
        });
    } catch (error) {
        console.error("Erreur lors de la modification de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const updatePostStatus = async (
    req: Request<PostIdParams, ApiResponse<PostDto>, { status: "DRAFT" | "PUBLISHED" }>,
    res: Response<ApiResponse<PostDto>>,
) => {
    try {
        const postId = getPostId(req.params.id);
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const status = req.body?.status;
        if (status !== "DRAFT" && status !== "PUBLISHED") {
            return res.status(422).json({
                success: false,
                message: "Statut invalide.",
            });
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        const publishedAt =
            status === "PUBLISHED" ? post.publishedAt ?? new Date() : null;
        await post.update({ status, publishedAt });

        const updatedPost = await Post.findByPk(postId, postQueryOptions);
        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        return res.status(200).json({
            success: true,
            data: toPostDto(updatedPost),
        });
    } catch (error) {
        console.error("Erreur lors du changement de statut de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const deletePost = async (
    req: Request<PostIdParams, ApiError>,
    res: Response<ApiError>,
) => {
    try {
        const postId = getPostId(req.params.id);
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const deletedCount = await Post.destroy({ where: { id: postId } });
        if (!deletedCount) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};
