import { Router } from "express";
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateUser,
} from "../../controllers/user.controller";
import {
    validateCreateUser,
    validateUpdateUser,
    validateUserId,
} from "../../validators/user.validator";
import { requireAuth } from "../../middlewares/auth.middleware";

const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/", getAllUsers);
userRouter.post("/", validateCreateUser, createUser);
userRouter.get("/:id", validateUserId, getUserById);
userRouter.patch("/:id", validateUserId, validateUpdateUser, updateUser);
userRouter.put("/:id", validateUserId, validateUpdateUser, updateUser);
userRouter.delete("/:id", validateUserId, deleteUser);

export default userRouter;
