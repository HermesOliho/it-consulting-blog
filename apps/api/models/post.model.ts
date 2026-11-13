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

class Post extends Model<
    InferAttributes<Post, { omit: "createdAt" | "updatedAt" }>,
    InferCreationAttributes<Post, { omit: "createdAt" | "updatedAt" }>
> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare slug: string;
    declare content: string;
    declare authorId: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare author?: NonAttribute<User | null>;
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        tableName: "posts",
    },
);

export default Post;
