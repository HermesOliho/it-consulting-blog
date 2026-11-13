import { Request, Response } from "express";
import { Post, User } from "../models/index.model";
import { toPostDto } from "../mappers";
import { isValidId } from "../utils";
import type { ApiError, ApiResponse } from "../types/api";
import type { PostDto } from "../types/post";
import type {
    CreatePostInput,
    PostIdParams,
    UpdatePostInput,
} from "../validators/post.validator";

const postAttributes = [
    "id",
    "title",
    "slug",
    "content",
    "authorId",
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
    ],
};

const getPostId = (id: string | string[]) =>
    isValidId(id) ? Number(id) : null;

const slugify = (title: string) =>
    title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "article";

const getAvailableSlug = async (title: string) => {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 2;

    while (await Post.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return slug;
};

export const getAllPosts = async (
    req: Request<{}, ApiResponse<PostDto[]>>,
    res: Response<ApiResponse<PostDto[]>>,
) => {
    try {
        const posts = await Post.findAll({
            ...postQueryOptions,
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: posts.map(toPostDto),
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

        const post = await Post.create({ title, slug, content, authorId });
        const createdPost = await Post.findByPk(
            post.id,
            postQueryOptions,
        );

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

        const { title, slug, content } = req.body;

        if (slug !== undefined && slug !== post.slug) {
            const existingPost = await Post.findOne({ where: { slug } });

            if (existingPost) {
                return res.status(409).json({
                    success: false,
                    message: "Ce slug est déjà utilisé.",
                });
            }
        }

        await post.update({ title, slug, content });

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
