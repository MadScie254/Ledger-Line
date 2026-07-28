const DEMO_ORG_ID = "org-ledgerline-demo";

export function getCurrentWorkspace() {
  return {
    orgId: process.env.LEDGERLINE_DEMO_ORG_ID ?? DEMO_ORG_ID,
    userId: process.env.LEDGERLINE_DEMO_USER_ID
  };
}
