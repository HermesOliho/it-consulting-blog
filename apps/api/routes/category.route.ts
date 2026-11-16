import { Router } from "express";
import { getCategoryById, listCategories } from "../controllers/category.controller";
import { validateCategoryId } from "../validators/category.validator";

const categoryRouter = Router();

categoryRouter.get("/", listCategories);
categoryRouter.get("/:id", validateCategoryId, getCategoryById);

export default categoryRouter;
