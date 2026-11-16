import { Request, Response } from "express";
import { Category } from "../models/index.model";
import { toCategoryDto } from "../mappers";
import { isValidId } from "../utils";
import type { ApiError, ApiResponse } from "../types/api";
import type { CategoryDto } from "../types/category";
import type {
    CategoryIdParams,
    CreateCategoryInput,
    UpdateCategoryInput,
} from "../validators/category.validator";

const slugify = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "categorie";

const getAvailableSlug = async (name: string, ignoreId?: number) => {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        const existing = await Category.findOne({ where: { slug } });
        if (!existing || (ignoreId && existing.id === ignoreId)) {
            return slug;
        }
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
};

const getId = (id: string | string[]) => (isValidId(id) ? Number(id) : null);

export const listCategories = async (
    _req: Request,
    res: Response<ApiResponse<CategoryDto[]>>,
) => {
    try {
        const categories = await Category.findAll({
            order: [["name", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            data: categories.map(toCategoryDto),
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const getCategoryById = async (
    req: Request<CategoryIdParams, ApiResponse<CategoryDto>>,
    res: Response<ApiResponse<CategoryDto>>,
) => {
    try {
        const id = getId(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Catégorie non trouvée !",
            });
        }

        return res.status(200).json({
            success: true,
            data: toCategoryDto(category),
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const createCategory = async (
    req: Request<{}, ApiResponse<CategoryDto>, CreateCategoryInput>,
    res: Response<ApiResponse<CategoryDto>>,
) => {
    try {
        const name = req.body.name;
        const slug = req.body.slug ?? (await getAvailableSlug(name));
        const existing = await Category.findOne({ where: { slug } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Ce slug de catégorie est déjà utilisé.",
            });
        }

        const category = await Category.create({
            name,
            slug,
            description: req.body.description ?? null,
        });

        return res.status(201).json({
            success: true,
            data: toCategoryDto(category),
        });
    } catch (error) {
        console.error("Erreur lors de la création de la catégorie :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const updateCategory = async (
    req: Request<CategoryIdParams, ApiResponse<CategoryDto>, UpdateCategoryInput>,
    res: Response<ApiResponse<CategoryDto>>,
) => {
    try {
        const id = getId(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Catégorie non trouvée !",
            });
        }

        const nextName = req.body.name ?? category.name;
        let nextSlug = req.body.slug ?? category.slug;
        if (req.body.name && !req.body.slug) {
            nextSlug = await getAvailableSlug(req.body.name, category.id);
        }

        if (nextSlug !== category.slug) {
            const existing = await Category.findOne({ where: { slug: nextSlug } });
            if (existing && existing.id !== category.id) {
                return res.status(409).json({
                    success: false,
                    message: "Ce slug de catégorie est déjà utilisé.",
                });
            }
        }

        await category.update({
            name: nextName,
            slug: nextSlug,
            description:
                req.body.description !== undefined
                    ? req.body.description
                    : category.description,
        });

        return res.status(200).json({
            success: true,
            data: toCategoryDto(category),
        });
    } catch (error) {
        console.error("Erreur lors de la modification de la catégorie :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};

export const deleteCategory = async (
    req: Request<CategoryIdParams, ApiError>,
    res: Response<ApiError>,
) => {
    try {
        const id = getId(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Identifiant invalide !",
            });
        }

        const deleted = await Category.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Catégorie non trouvée !",
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur !",
        });
    }
};
