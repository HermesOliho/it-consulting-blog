import type Post from "../models/post.model";
import type { PostDto } from "../types/post";
import { toCategoryDto } from "./category.mapper";

export const toPostDto = (post: Post): PostDto => {
    const createdAt = post.createdAt.toISOString();
    const updatedAt = post.updatedAt.toISOString();
    const publishedAt = post.publishedAt ? post.publishedAt.toISOString() : null;

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? null,
        content: post.content,
        coverImage: post.coverImage ?? null,
        cover_image: post.coverImage ?? null,
        status: post.status,
        publishedAt,
        published_at: publishedAt,
        authorId: post.authorId,
        author: post.author
            ? {
                  id: post.author.id,
                  name: post.author.name,
              }
            : null,
        categoryId: post.categoryId ?? null,
        category: post.category ? toCategoryDto(post.category) : null,
        createdAt,
        created_at: createdAt,
        updatedAt,
        updated_at: updatedAt,
    };
};
