import type { CommentAuthorType } from "../models/comment.model";

export interface PublicCommentDto {
    id: number;
    postId: number;
    content: string;
    authorType: CommentAuthorType;
    name: string;
    author: {
        id: number;
        name: string;
    } | null;
    createdAt: string;
}

export interface AdminCommentDto extends PublicCommentDto {
    approved: boolean;
    email: string | null;
    author: {
        id: number;
        name: string;
        email: string;
    } | null;
    updatedAt: string;
}
