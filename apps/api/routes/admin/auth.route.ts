import { Router } from "express";
import { logout } from "../../controllers/auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const adminAuthRouter = Router();

adminAuthRouter.use(requireAuth);
adminAuthRouter.post("/logout", logout);

export default adminAuthRouter;
