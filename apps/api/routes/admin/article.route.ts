import { Router } from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    updatePost,
} from "../../controllers/post.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
    validateCreatePost,
    validatePostId,
    validateUpdatePost,
} from "../../validators/post.validator";

const adminArticleRouter = Router();

adminArticleRouter.use(requireAuth);
adminArticleRouter.get("/", getAllPosts);
adminArticleRouter.post("/", validateCreatePost, createPost);
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
