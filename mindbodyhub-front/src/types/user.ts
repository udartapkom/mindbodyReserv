export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
export type User = {
    id: string;
    phone: string;
    name?: string;
    avatar?: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
};