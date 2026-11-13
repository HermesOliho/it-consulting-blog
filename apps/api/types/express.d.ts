import type { AuthTokenPayload } from "./auth";

declare global {
    namespace Express {
        interface Locals {
            auth?: AuthTokenPayload;
        }
    }
}

export {};
