import db from "../config/db";
import User from "./user.model";
import Post from "./post.model";

// Définition des associations
User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

const syncModels = async () => {
    try {
        await db.sync({ alter: false });
        console.log("Modèles synchronisés avec succès");
    } catch (error) {
        console.error("Erreur lors de la synchronisation des modèles:", error);
        throw error;
    }
};

export { User, Post, syncModels };
