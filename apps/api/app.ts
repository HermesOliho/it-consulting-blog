import express from "express";
import cors from "cors";
import { syncModels } from "./models/index.model";
import { PORT } from "./config/env";
import userRouter from "./user.route";
// import { PORT } from "./config/env";

const app = express();

app.use(express.json());

// Test du serveur (route racine)
app.get("/", (req, res) => {
    return res
        .status(200)
        .send(
            "Bienvenue sur l'API de mon blog IT Consulting ! Tout marche très bien.",
        );
});

// Autoriser les URL des frontends et les méthodes HTTP via CORS
app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
);

// Déclarer les routes
app.use("/api/users", userRouter);

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
