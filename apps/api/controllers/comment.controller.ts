import { Request, Response } from "express";
import { Comment, Post, User } from "../models/index.model";

const commentQueryOptions = {
    include: [
        {
            model: User,
            as: "author",
            attributes: ["id", "name", "email"],
            required: false,
        },
    ],
};

const getAuthor = (comment: any) => comment.get("author") ?? null;

const formatPublicComment = (comment: any) => {
    const author = getAuthor(comment);

    return {
        id: comment.get("id"),
        postId: comment.get("postId"),
        content: comment.get("content"),
        authorType: comment.get("authorType"),
        name: comment.get("name"),
        author: author
            ? {
                  id: author.get("id"),
                  name: author.get("name"),
              }
            : null,
        createdAt: comment.get("createdAt"),
    };
};

const formatAdminComment = (comment: any) => {
    const author = getAuthor(comment);

    return {
        id: comment.get("id"),
        postId: comment.get("postId"),
        content: comment.get("content"),
        approved: comment.get("approved"),
        authorType: comment.get("authorType"),
        name: comment.get("name"),
        email: author ? author.get("email") : comment.get("email"),
        author: author
            ? {
                  id: author.get("id"),
                  name: author.get("name"),
                  email: author.get("email"),
              }
            : null,
        createdAt: comment.get("createdAt"),
        updatedAt: comment.get("updatedAt"),
    };
};

const postExists = async (postId: number) => {
    const post = await Post.findByPk(postId, { attributes: ["id"] });
    return Boolean(post);
};

const findCommentWithAuthor = (id: number) =>
    Comment.findByPk(id, commentQueryOptions);

export const getApprovedCommentsByPost = async (
    req: Request,
    res: Response,
) => {
    try {
        const postId = Number(req.params.postId);

        if (!(await postExists(postId))) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        const comments = await Comment.findAll({
            ...commentQueryOptions,
            where: { postId, approved: true },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: comments.map(formatPublicComment),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des commentaires :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const createGuestComment = async (req: Request, res: Response) => {
    try {
        const postId = Number(req.params.postId);

        if (!(await postExists(postId))) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        const { name, email, content } = req.body;

        const comment = await Comment.create({
            postId,
            authorId: null,
            authorType: "visitor",
            name,
            email,
            content,
            approved: false,
        });

        return res.status(201).json({
            success: true,
            message:
                "Commentaire envoyé. Il sera visible après approbation.",
            data: formatPublicComment(comment),
        });
    } catch (error) {
        console.error("Erreur lors de la création du commentaire :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getAllComments = async (req: Request, res: Response) => {
    try {
        const where: {
            postId?: number;
            approved?: boolean;
        } = {};

        if (typeof req.query.postId === "string") {
            where.postId = Number(req.query.postId);
        }

        if (req.query.approved === "true") {
            where.approved = true;
        } else if (req.query.approved === "false") {
            where.approved = false;
        }

        const comments = await Comment.findAll({
            ...commentQueryOptions,
            where,
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: comments.map(formatAdminComment),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des commentaires :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getCommentById = async (req: Request, res: Response) => {
    try {
        const comment = await findCommentWithAuthor(Number(req.params.id));

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé !",
            });
        }

        return res.status(200).json({
            success: true,
            data: formatAdminComment(comment),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du commentaire :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const updateCommentApproval = async (req: Request, res: Response) => {
    try {
        const commentId = Number(req.params.id);
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé !",
            });
        }

        await comment.update({ approved: req.body.approved });

        return res.status(200).json({
            success: true,
            data: formatAdminComment(
                await findCommentWithAuthor(commentId),
            ),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la modération du commentaire :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const deletedCount = await Comment.destroy({
            where: { id: Number(req.params.id) },
        });

        if (!deletedCount) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé !",
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error(
            "Erreur lors de la suppression du commentaire :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const createMemberComment = async (req: Request, res: Response) => {
    try {
        const postId = Number(req.params.postId);
        const userId = Number(res.locals.auth?.sub);

        const user = await User.findByPk(userId, {
            attributes: ["id", "name"],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Utilisateur authentifié invalide.",
            });
        }

        if (!(await postExists(postId))) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé !",
            });
        }

        const comment = await Comment.create({
            postId,
            authorId: user.get("id") as number,
            authorType: "member",
            name: user.get("name") as string,
            email: null,
            content: req.body.content,
            approved: true,
        });

        return res.status(201).json({
            success: true,
            data: formatAdminComment(
                await findCommentWithAuthor(
                    Number(comment.get("id") as number),
                ),
            ),
        });
    } catch (error) {
        console.error(
            "Erreur lors de la création du commentaire membre :",
            error,
        );
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};
