import { Router } from "express";
import { getCurrentUser, login } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateLogin } from "../validators/auth.validator";

const authRouter = Router();

authRouter.post("/login", validateLogin, login);
authRouter.get("/me", requireAuth, getCurrentUser);

export default authRouter;
