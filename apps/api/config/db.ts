import { Sequelize } from "sequelize";
import {
    DB_HOST,
    DB_NAME,
    DB_PASS,
    DB_PORT,
    DB_USER,
    NODE_ENV,
} from "./env.js";

// Vérification des variables d'environnement pour la configuration de la base de données
if (!DB_HOST) {
    throw new Error(
        "Veuillez définir l'adresse de l'hôte de la base de donnée dans les variables d'environnement .env.<development/production>.local",
    );
}

if (!DB_NAME) {
    throw new Error(
        "Veuillez définir le nom de la base de donnée dans les variables d'environnement .env.<development/production>.local",
    );
}

if (!DB_USER) {
    throw new Error(
        "Veuillez définir le nom d'utilisateur de la base de donnée dans les variables d'environnement .env.<development/production>.local",
    );
}

if (!DB_PASS) {
    throw new Error(
        "Veuillez définir le mot de passe de la base de donnée dans les variables d'environnement .env.<development/production>.local",
    );
}
if (!DB_PORT) {
    throw new Error(
        "Veuillez définir le port de la base de donnée dans les variables d'environnement .env.<development/production>.local",
    );
}

// Création d'une instance Sequelize pour la connexion à la base de données
const db = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: "mysql",
    logging: NODE_ENV === "development" ? console.log : false,
});

(async () => {
    try {
        await db.authenticate();
        console.log(
            `Connexion à la base de données ${DB_NAME} réussie en mode ${NODE_ENV}`,
        );
    } catch (err) {
        console.error(
            "Erreur de connexion à la base de données :",
            err.message,
        );
    }
})();

export default db;
