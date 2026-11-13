import type Comment from "../models/comment.model";
import type { AdminCommentDto, PublicCommentDto } from "../types/comment";

export const toPublicCommentDto = (comment: Comment): PublicCommentDto => ({
    id: comment.id,
    postId: comment.postId,
    content: comment.content,
    authorType: comment.authorType,
    name: comment.name,
    author: comment.author
        ? {
              id: comment.author.id,
              name: comment.author.name,
          }
        : null,
    createdAt: comment.createdAt.toISOString(),
});

export const toAdminCommentDto = (comment: Comment): AdminCommentDto => ({
    id: comment.id,
    postId: comment.postId,
    content: comment.content,
    approved: comment.approved,
    authorType: comment.authorType,
    name: comment.name,
    email: comment.author ? comment.author.email : comment.email,
    author: comment.author
        ? {
              id: comment.author.id,
              name: comment.author.name,
              email: comment.author.email,
          }
        : null,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
});
