import { Router } from "express";
import {
    deleteComment,
    getAllComments,
    getCommentById,
    updateCommentApproval,
} from "../../controllers/comment.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
    validateCommentId,
    validateCommentListQuery,
    validateUpdateComment,
} from "../../validators/comment.validator";

const adminCommentRouter = Router();

// Modération des commentaires : super_admin et admin.
adminCommentRouter.use(requireAuth, requireRole("super_admin", "admin"));
adminCommentRouter.get("/", validateCommentListQuery, getAllComments);
adminCommentRouter.get("/:id", validateCommentId, getCommentById);
adminCommentRouter.patch(
    "/:id",
    validateCommentId,
    validateUpdateComment,
    updateCommentApproval,
);
adminCommentRouter.delete("/:id", validateCommentId, deleteComment);

export default adminCommentRouter;
