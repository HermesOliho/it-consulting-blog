import express from "express";
import cors from "cors";
import { syncModels } from "./models/index.model";
import { PORT } from "./config/env";
import userRouter from "./routes/admin/user.route";
import authRouter from "./routes/auth.route";
import articleRouter from "./routes/article.route";
import categoryRouter from "./routes/category.route";
import adminArticleRouter from "./routes/admin/article.route";
import adminCategoryRouter from "./routes/admin/category.route";
import adminCommentRouter from "./routes/admin/comment.route";
import adminAuthRouter from "./routes/admin/auth.route";

const app = express();

app.use(express.json());

// Autoriser les URL des frontends et les méthodes HTTP via CORS
app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
);

// Test du serveur (route racine)
app.get("/", (_req, res) => {
    return res
        .status(200)
        .send(
            "Bienvenue sur l'API de mon blog IT Consulting ! Tout marche très bien.",
        );
});

// Déclarer les routes
app.use("/api/admin/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/articles", articleRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin/articles", adminArticleRouter);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/comments", adminCommentRouter);

app.listen(PORT, async (err) => {
    if (err) {
        console.log(`Une erreur s'est produite: ${err}`);
    } else {
        try {
            console.log(`Serveur lancé à http://localhost:${PORT}/`);
            await syncModels();
        } catch (error) {
            console.error(
                "Erreur lors de la synchronisation des modèles:",
                error,
            );
        }
    }
});
