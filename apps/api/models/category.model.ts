import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import db from "../config/db";

class Category extends Model<
    InferAttributes<Category, { omit: "createdAt" | "updatedAt" }>,
    InferCreationAttributes<Category, { omit: "createdAt" | "updatedAt" }>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare slug: string;
    declare description: string | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(140),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: db,
        tableName: "categories",
    },
);

export default Category;
