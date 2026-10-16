/** "Super Admin", "super_admin", "super-admin" and "superadmin" all mean the same role. */
export const normalizeRole = (role: unknown): string => String(role ?? "").toLowerCase().replace(/[\s_-]/g, "");

export const isSuperAdminRole = (role: unknown): boolean => normalizeRole(role) === "superadmin";

/** True when the role is in the allowed list. The super admin is never excluded. */
export const roleAllowed = (role: unknown, allowed: readonly string[]): boolean =>
     isSuperAdminRole(role) || allowed.some((item) => normalizeRole(item) === normalizeRole(role));
