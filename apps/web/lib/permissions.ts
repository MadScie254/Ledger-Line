export interface PermissionContext {
  all?: boolean;
  accounting?: boolean;
  banking?: boolean;
  sales?: boolean;
  purchases?: boolean;
  payroll?: boolean;
  reports?: boolean;
  settings?: boolean;
}

export function hasPermission(rolePermissions: any, required: keyof PermissionContext): boolean {
  if (!rolePermissions || typeof rolePermissions !== "object") {
    return false;
  }
  
  if (rolePermissions.all === true) {
    return true;
  }
  
  return rolePermissions[required] === true;
}

export function requirePermission(rolePermissions: any, required: keyof PermissionContext) {
  if (!hasPermission(rolePermissions, required)) {
    throw new Error(`Permission denied: requires '${required}' access.`);
  }
}
