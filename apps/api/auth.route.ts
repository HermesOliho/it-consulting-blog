import { Router } from "express";
import { login, logout } from "./controllers/auth.controller";
import { requireAuth } from "./middlewares/auth.middleware";
import { validateLogin } from "./validators/auth.validator";

const authRouter = Router();

authRouter.post("/login", validateLogin, login);
authRouter.post("/logout", requireAuth, logout);

export default authRouter;
