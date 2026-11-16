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
import type Category from "./category.model";

export type PostStatus = "DRAFT" | "PUBLISHED";

class Post extends Model<
    InferAttributes<Post, { omit: "createdAt" | "updatedAt" }>,
    InferCreationAttributes<Post, { omit: "createdAt" | "updatedAt" }>
> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare slug: string;
    declare excerpt: string | null;
    declare content: string;
    declare coverImage: string | null;
    declare status: CreationOptional<PostStatus>;
    declare publishedAt: Date | null;
    declare authorId: number;
    declare categoryId: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare author?: NonAttribute<User | null>;
    declare category?: NonAttribute<Category | null>;
}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        coverImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("DRAFT", "PUBLISHED"),
            allowNull: false,
            defaultValue: "DRAFT",
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize: db,
        tableName: "posts",
    },
);

export default Post;
