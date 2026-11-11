import { config } from "dotenv";

config({ path: `./.env.${process.env.NODE_ENV || "development"}.local` });

export const {
    PORT,
    NODE_ENV,
    URL_ORIGIN,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASS,
    DB_NAME,
    EMAIL,
    EMAIL_PASSWORD,
    HOST_URL,
} = process.env;
