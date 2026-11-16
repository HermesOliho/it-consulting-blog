import { Router } from "express";
import {
    createCategory,
    deleteCategory,
    getCategoryById,
    listCategories,
    updateCategory,
} from "../../controllers/category.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
    validateCategoryId,
    validateCreateCategory,
    validateUpdateCategory,
} from "../../validators/category.validator";

const adminCategoryRouter = Router();

adminCategoryRouter.use(requireAuth, requireRole("super_admin", "admin"));
adminCategoryRouter.get("/", listCategories);
adminCategoryRouter.post("/", validateCreateCategory, createCategory);
adminCategoryRouter.get("/:id", validateCategoryId, getCategoryById);
adminCategoryRouter.patch(
    "/:id",
    validateCategoryId,
    validateUpdateCategory,
    updateCategory,
);
adminCategoryRouter.put(
    "/:id",
    validateCategoryId,
    validateUpdateCategory,
    updateCategory,
);
adminCategoryRouter.delete("/:id", validateCategoryId, deleteCategory);

export default adminCategoryRouter;
