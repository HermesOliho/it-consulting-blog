import db from "../config/db";
import User from "./user.model";

const syncModels = async () => {
    try {
        await db.sync({ alter: false });
        console.log("Modèles synchronisés avec succès");
    } catch (error) {
        console.error("Erreur lors de la synchronisation des modèles:", error);
        throw error;
    }
};

export { User, syncModels };
