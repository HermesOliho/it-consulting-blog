import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import db from "../config/db";

export type UserRole = "super_admin" | "admin";

class User extends Model<
    InferAttributes<User, { omit: "createdAt" | "updatedAt" }>,
    InferCreationAttributes<User, { omit: "createdAt" | "updatedAt" }>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare password: string;
    declare role: CreationOptional<UserRole>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("super_admin", "admin"),
            defaultValue: "admin",
            allowNull: false,
        },
    },
    {
        sequelize: db,
        tableName: "users",
    },
);

export default User;
