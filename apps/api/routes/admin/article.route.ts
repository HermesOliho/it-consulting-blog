import { Router } from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    updatePost,
} from "../../controllers/post.controller";
import { createMemberComment } from "../../controllers/comment.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
    validateCreatePost,
    validatePostId,
    validateUpdatePost,
} from "../../validators/post.validator";
import {
    validateCommentPostId,
    validateCreateMemberComment,
} from "../../validators/comment.validator";

const adminArticleRouter = Router();

// Gestion des articles : super_admin et admin.
adminArticleRouter.use(requireAuth, requireRole("super_admin", "admin"));
adminArticleRouter.get("/", getAllPosts);
adminArticleRouter.post("/", validateCreatePost, createPost);
adminArticleRouter.post(
    "/:postId/comments",
    validateCommentPostId,
    validateCreateMemberComment,
    createMemberComment,
);
adminArticleRouter.get("/:id", validatePostId, getPostById);
adminArticleRouter.patch(
    "/:id",
    validatePostId,
    validateUpdatePost,
    updatePost,
);
adminArticleRouter.put(
    "/:id",
    validatePostId,
    validateUpdatePost,
    updatePost,
);
adminArticleRouter.delete("/:id", validatePostId, deletePost);

export default adminArticleRouter;
