/**
 * Hook to get admin font configurations
 * Admin panel uses Nunito font consistently
 */
export function useAdminFonts() {
  // Admin panel always uses Nunito for consistency
  const adminFont = 'font-nunito';

  return {
    adminBody: adminFont,
    adminHeading: adminFont,
    adminButton: adminFont,
    adminLabel: adminFont,
    adminNavigation: adminFont,
    admin: adminFont,
  };
}
