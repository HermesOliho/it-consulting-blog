import { Router } from "express";
import {
    getAllPosts,
    getPostById,
} from "../controllers/post.controller";
import {
    createGuestComment,
    getApprovedCommentsByPost,
} from "../controllers/comment.controller";
import { validateListPostsQuery, validatePostId } from "../validators/post.validator";
import {
    validateCommentPostId,
    validateCreateGuestComment,
} from "../validators/comment.validator";

const articleRouter = Router();

articleRouter.get("/", validateListPostsQuery, getAllPosts);
articleRouter.get(
    "/:postId/comments",
    validateCommentPostId,
    getApprovedCommentsByPost,
);
articleRouter.post(
    "/:postId/comments",
    validateCommentPostId,
    validateCreateGuestComment,
    createGuestComment,
);
articleRouter.get("/:id", validatePostId, getPostById);

export default articleRouter;
