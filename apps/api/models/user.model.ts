import db from "../config/db";
import { DataTypes } from "sequelize";

const User = db.define(
    "User",
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
        tableName: "users",
    },
);

export default User;
