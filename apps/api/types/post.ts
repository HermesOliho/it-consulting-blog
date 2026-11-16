import type { CategoryDto } from "./category";

export type PostStatus = "DRAFT" | "PUBLISHED";

export interface PostAuthorDto {
    id: number;
    name: string;
}

export interface PostDto {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    cover_image: string | null;
    status: PostStatus;
    publishedAt: string | null;
    published_at: string | null;
    authorId: number;
    author: PostAuthorDto | null;
    categoryId: number | null;
    category: CategoryDto | null;
    createdAt: string;
    created_at: string;
    updatedAt: string;
    updated_at: string;
}
