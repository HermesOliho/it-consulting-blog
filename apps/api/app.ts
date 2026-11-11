import express from "express";
// import { PORT } from "./config/env";

const app = express();

// Test du serveur (route racine)
app.get("/", (req, res) => {
    return res
        .status(200)
        .send(
            "Bienvenue sur l'API de mon blog IT Consulting ! Tout marche très bien.",
        );
});

app.listen(8080, async (err) => {
    if (err) {
        console.log(`Une erreur s'est produite: ${err}`);
    } else {
        console.log(`Serveur lancé à http://localhost:8080/`);
    }
});
