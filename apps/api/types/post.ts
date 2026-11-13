export interface PostAuthorDto {
    id: number;
    name: string;
}

export interface PostDto {
    id: number;
    title: string;
    slug: string;
    content: string;
    authorId: number;
    author: PostAuthorDto | null;
    createdAt: string;
    updatedAt: string;
}
