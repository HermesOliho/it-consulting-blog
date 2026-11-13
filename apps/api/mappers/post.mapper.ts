import type Post from "../models/post.model";
import type { PostDto } from "../types/post";

export const toPostDto = (post: Post): PostDto => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    authorId: post.authorId,
    author: post.author
        ? {
              id: post.author.id,
              name: post.author.name,
          }
        : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
});
