export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export function canManageWorkspace(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function assertWorkspaceManagerRole(role: WorkspaceRole) {
  if (!canManageWorkspace(role)) throw new Error("Forbidden");
}
