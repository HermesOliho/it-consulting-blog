import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { validateLogin } from "../validators/auth.validator";

const authRouter = Router();

authRouter.post("/login", validateLogin, login);

export default authRouter;
