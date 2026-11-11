import { Request, Response } from "express";
import { Post, User } from "../models/index.model";
import { isValidId } from "../utils";

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

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll({
            ...postQueryOptions,
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Erreur lors de la récupération des articles :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getPostById = async (req: Request, res: Response) => {
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

        return res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const authorId = Number(res.locals.auth?.sub);

        if (!Number.isInteger(authorId) || authorId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Utilisateur authentifié invalide.",
            });
        }

        const { title, slug, content } = req.body;
        const existingPost = await Post.findOne({ where: { slug } });

        if (existingPost) {
            return res.status(409).json({
                success: false,
                message: "Ce slug est déjà utilisé.",
            });
        }

        const post = await Post.create({ title, slug, content, authorId });

        return res.status(201).json({
            success: true,
            data: await Post.findByPk(
                Number(post.get("id")),
                postQueryOptions,
            ),
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const updatePost = async (req: Request, res: Response) => {
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

        if (slug !== undefined && slug !== post.get("slug")) {
            const existingPost = await Post.findOne({ where: { slug } });

            if (existingPost) {
                return res.status(409).json({
                    success: false,
                    message: "Ce slug est déjà utilisé.",
                });
            }
        }

        await post.update({ title, slug, content });

        return res.status(200).json({
            success: true,
            data: await Post.findByPk(postId, postQueryOptions),
        });
    } catch (error) {
        console.error("Erreur lors de la modification de l'article :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const deletePost = async (req: Request, res: Response) => {
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