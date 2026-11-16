import type Category from "../models/category.model";
import type { CategoryDto } from "../types/category";

export const toCategoryDto = (category: Category): CategoryDto => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
});
