import { Request, Response } from "express";
import { Comment, Post, User } from "../models/index.model";
import { toAdminCommentDto, toPublicCommentDto } from "../mappers";
import type { ApiError, ApiResponse } from "../types/api";
import type { AdminCommentDto, PublicCommentDto } from "../types/comment";
import type {
    CommentIdParams,
    CommentListQuery,
    CommentPostIdParams,
    CreateGuestCommentInput,
    CreateMemberCommentInput,
    UpdateCommentInput,
} from "../validators/comment.validator";

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

const postExists = async (postId: number) => {
    const post = await Post.findByPk(postId, { attributes: ["id"] });
    return Boolean(post);
};

const findCommentWithAuthor = (id: number) =>
    Comment.findByPk(id, commentQueryOptions);

export const getApprovedCommentsByPost = async (
    req: Request<CommentPostIdParams, ApiResponse<PublicCommentDto[]>>,
    res: Response<ApiResponse<PublicCommentDto[]>>,
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
            data: comments.map(toPublicCommentDto),
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

export const createGuestComment = async (
    req: Request<
        CommentPostIdParams,
        ApiResponse<PublicCommentDto>,
        CreateGuestCommentInput
    >,
    res: Response<ApiResponse<PublicCommentDto>>,
) => {
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
            data: toPublicCommentDto(comment),
        });
    } catch (error) {
        console.error("Erreur lors de la création du commentaire :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getAllComments = async (
    req: Request<{}, ApiResponse<AdminCommentDto[]>, unknown, CommentListQuery>,
    res: Response<ApiResponse<AdminCommentDto[]>>,
) => {
    try {
        const where: {
            postId?: number;
            approved?: boolean;
        } = {};

        if (req.query.postId !== undefined) {
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
            data: comments.map(toAdminCommentDto),
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

export const getCommentById = async (
    req: Request<CommentIdParams, ApiResponse<AdminCommentDto>>,
    res: Response<ApiResponse<AdminCommentDto>>,
) => {
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
            data: toAdminCommentDto(comment),
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

export const updateCommentApproval = async (
    req: Request<
        CommentIdParams,
        ApiResponse<AdminCommentDto>,
        UpdateCommentInput
    >,
    res: Response<ApiResponse<AdminCommentDto>>,
) => {
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

        const updatedComment = await findCommentWithAuthor(commentId);

        if (!updatedComment) {
            return res.status(404).json({
                success: false,
                message: "Commentaire non trouvé !",
            });
        }

        return res.status(200).json({
            success: true,
            data: toAdminCommentDto(updatedComment),
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

export const deleteComment = async (
    req: Request<CommentIdParams, ApiError>,
    res: Response<ApiError>,
) => {
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

export const createMemberComment = async (
    req: Request<
        CommentPostIdParams,
        ApiResponse<AdminCommentDto>,
        CreateMemberCommentInput
    >,
    res: Response<ApiResponse<AdminCommentDto>>,
) => {
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
            authorId: user.id,
            authorType: "member",
            name: user.name,
            email: null,
            content: req.body.content,
            approved: true,
        });

        const createdComment = await findCommentWithAuthor(comment.id);

        if (!createdComment) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur !",
            });
        }

        return res.status(201).json({
            success: true,
            data: toAdminCommentDto(createdComment),
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
