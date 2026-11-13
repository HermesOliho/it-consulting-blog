import db from "../config/db";
import User from "./user.model";
import Post from "./post.model";
import Comment from "./comment.model";

// Définition des associations
User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

Post.hasMany(Comment, {
    foreignKey: "postId",
    as: "comments",
    onDelete: "CASCADE",
});
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

User.hasMany(Comment, {
    foreignKey: "authorId",
    as: "comments",
    onDelete: "SET NULL",
});
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

const syncModels = async () => {
    try {
        await db.sync({ alter: false });
        console.log("Modèles synchronisés avec succès");
    } catch (error) {
        console.error("Erreur lors de la synchronisation des modèles:", error);
        throw error;
    }
};

export { User, Post, Comment, syncModels };
