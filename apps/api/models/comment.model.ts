import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import db from "../config/db";
import type User from "./user.model";

export type CommentAuthorType = "member" | "visitor";

class Comment extends Model<
    InferAttributes<Comment, { omit: "createdAt" | "updatedAt" }>,
    InferCreationAttributes<Comment, { omit: "createdAt" | "updatedAt" }>
> {
    declare id: CreationOptional<number>;
    declare postId: number;
    declare authorId: number | null;
    declare authorType: CommentAuthorType;
    declare name: string;
    declare email: string | null;
    declare content: string;
    declare approved: CreationOptional<boolean>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare author?: NonAttribute<User | null>;
}

Comment.init(
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
        sequelize: db,
        tableName: "comments",
    },
);

export default Comment;
