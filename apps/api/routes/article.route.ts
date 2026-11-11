import { Router } from "express";
import {
    getAllPosts,
    getPostById,
} from "../controllers/post.controller";
import { validatePostId } from "../validators/post.validator";

const articleRouter = Router();

articleRouter.get("/", getAllPosts);
articleRouter.get("/:id", validatePostId, getPostById);

export default articleRouter;
