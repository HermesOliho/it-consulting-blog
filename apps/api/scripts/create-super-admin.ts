import argon2 from "argon2";
import readline, { Key } from "node:readline";
import { createUserSchema } from "../validators/user.validator";

const PROMOTE_FLAG = "--promote-existing";

class CliError extends Error {}

let closeDatabase: (() => Promise<void>) | undefined;

const ask = (question: string) =>
    new Promise<string>((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });

const askHidden = (question: string) =>
    new Promise<string>((resolve, reject) => {
        if (!process.stdin.isTTY) {
            reject(
                new CliError(
                    "La saisie interactive nécessite un terminal. Utilisez les variables SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL et SUPER_ADMIN_PASSWORD.",
                ),
            );
            return;
        }

        const input = process.stdin;
        const output = process.stdout;
        let value = "";

        output.write(question);

        const cleanup = () => {
            input.off("keypress", onKeypress);
            input.setRawMode(false);
            input.pause();
        };

        const onKeypress = (str: string | undefined, key: Key) => {
            if (key.ctrl && key.name === "c") {
                cleanup();
                output.write("\n");
                reject(new CliError("Saisie annulée."));
                return;
            }

            if (key.name === "return" || key.name === "enter") {
                cleanup();
                output.write("\n");
                resolve(value);
                return;
            }

            if (key.name === "backspace") {
                if (value.length > 0) {
                    value = value.slice(0, -1);
                    output.write("\b \b");
                }
                return;
            }

            if (str && !key.ctrl && !key.meta) {
                value += str;
                output.write("*");
            }
        };

        readline.emitKeypressEvents(input);
        input.setRawMode(true);
        input.resume();
        input.on("keypress", onKeypress);
    });

const getCredentials = async () => {
    const envName = process.env.SUPER_ADMIN_NAME;
    const envEmail = process.env.SUPER_ADMIN_EMAIL;
    const envPassword = process.env.SUPER_ADMIN_PASSWORD;
    const providedValues = [envName, envEmail, envPassword].filter(
        (value) => value !== undefined,
    ).length;

    if (providedValues > 0 && providedValues < 3) {
        throw new CliError(
            "Les variables SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL et SUPER_ADMIN_PASSWORD doivent être définies ensemble.",
        );
    }

    if (providedValues === 3) {
        return {
            name: envName ?? "",
            email: envEmail ?? "",
            password: envPassword ?? "",
        };
    }

    const name = await ask("Nom du super administrateur : ");
    const email = await ask("Adresse email : ");
    const password = await askHidden("Mot de passe : ");
    const confirmation = await askHidden("Confirmer le mot de passe : ");

    if (password !== confirmation) {
        throw new CliError("Les deux mots de passe ne correspondent pas.");
    }

    return { name, email, password };
};

const main = async () => {
    const credentials = await getCredentials();

    if (credentials.password.length < 8) {
        throw new CliError(
            "Le mot de passe doit contenir au moins 8 caractères.",
        );
    }

    const validation = createUserSchema.safeParse({
        ...credentials,
        role: "super_admin",
    });

    if (!validation.success) {
        const details = validation.error.issues
            .map((issue) => `- ${issue.path.join(".")} : ${issue.message}`)
            .join("\n");

        throw new CliError(`Données invalides :\n${details}`);
    }

    const { name, email, password } = validation.data;

    const [{ default: db }, { syncModels, User }] = await Promise.all([
        import("../config/db"),
        import("../models/index.model"),
    ]);

    closeDatabase = () => db.close();

    await syncModels();

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        if (existingUser.role === "super_admin") {
            console.log(
                `Un super administrateur existe déjà avec l'email ${email}.`,
            );
            return;
        }

        if (!process.argv.includes(PROMOTE_FLAG)) {
            throw new CliError(
                `Un utilisateur existe déjà avec l'email ${email} et le rôle ${existingUser.role}. Utilisez ${PROMOTE_FLAG} pour le promouvoir super_admin.`,
            );
        }

        await existingUser.update({ role: "super_admin" });
        console.log(
            `Utilisateur ${email} promu super_admin (id ${existingUser.id}).`,
        );
        return;
    }

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
    });

    const user = await User.create({
        name,
        email,
        password: passwordHash,
        role: "super_admin",
    });

    console.log(
        `Super administrateur créé : id ${user.id}, email ${user.email}.`,
    );
};

main()
    .catch((error: unknown) => {
        if (error instanceof CliError) {
            console.error(`Erreur : ${error.message}`);
        } else {
            console.error("Erreur inattendue :", error);
        }
        process.exitCode = 1;
    })
    .finally(async () => {
        await closeDatabase?.();
    });
