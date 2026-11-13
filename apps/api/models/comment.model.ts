import { DataTypes } from "sequelize";
import db from "../config/db";

const Comment = db.define(
    "Comment",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        authorType: {
            type: DataTypes.ENUM("member", "visitor"),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "comments",
    },
);

export default Comment;
