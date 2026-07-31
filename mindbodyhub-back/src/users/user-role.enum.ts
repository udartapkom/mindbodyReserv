export enum UserRole {
  USER = 'user',
  EDITOR = 'editor',
  ADMIN = 'admin',
}

/** Roles that may sign in to the admin panel */
export const ADMIN_PANEL_ROLES: readonly UserRole[] = [
  UserRole.ADMIN,
  UserRole.EDITOR,
] as const;

export function canAccessAdminPanel(role: UserRole | string | null | undefined): boolean {
  return role === UserRole.ADMIN || role === UserRole.EDITOR;
}

export function isAdminRole(role: UserRole | string | null | undefined): boolean {
  return role === UserRole.ADMIN;
}
