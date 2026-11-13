export interface ApiErrorItem {
    field: string;
    message: string;
}

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiMessage {
    success: true;
    message: string;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: ApiErrorItem[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiMessage | ApiError;

export interface IdParams {
    id: string;
}

export interface PostIdParams {
    postId: string;
}
