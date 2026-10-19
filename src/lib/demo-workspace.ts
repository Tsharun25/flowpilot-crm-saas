type DemoWorkspaceIdentity = {
  isDemo: boolean;
  slug: string;
};

const LEGACY_DEMO_SLUG_PREFIXES = [
  "flowpilot-demo-",
  "demo-user-workspace-",
  "demo-account-workspace-",
];

export const DEMO_ACCOUNT_EMAIL = "demo@flowpilot.com";

export function isDemoWorkspace(
  workspace: DemoWorkspaceIdentity,
  userEmail?: string | null,
) {
  return (
    workspace.isDemo ||
    (userEmail?.toLowerCase() === DEMO_ACCOUNT_EMAIL &&
      (workspace.slug === "flowpilot-demo" ||
        LEGACY_DEMO_SLUG_PREFIXES.some((prefix) =>
          workspace.slug.startsWith(prefix),
        )))
  );
}
