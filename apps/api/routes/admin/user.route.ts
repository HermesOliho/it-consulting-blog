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
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const userRouter = Router();

// Lecture : accessible à tous les utilisateurs authentifiés ayant un rôle
// connu. Écriture : réservée au super administrateur.
userRouter.use(requireAuth, requireRole("super_admin", "admin"));
userRouter.get("/", getAllUsers);
userRouter.get("/:id", validateUserId, getUserById);

// Écriture : réservée au super administrateur.
userRouter.post("/", requireRole("super_admin"), validateCreateUser, createUser);
userRouter.patch(
    "/:id",
    requireRole("super_admin"),
    validateUserId,
    validateUpdateUser,
    updateUser,
);
userRouter.put(
    "/:id",
    requireRole("super_admin"),
    validateUserId,
    validateUpdateUser,
    updateUser,
);
userRouter.delete(
    "/:id",
    requireRole("super_admin"),
    validateUserId,
    deleteUser,
);

export default userRouter;
