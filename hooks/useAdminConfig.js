import adminConfig from '../config/admin.json';

export function useAdminConfig() {
  return adminConfig;
}

export function useAdminTabs() {
  return adminConfig.admin?.tabs || [];
}

export function useAdminTheme() {
  return adminConfig.admin?.theme || {};
}

export function useAdminLogin() {
  return adminConfig.adminLogin || {};
}

export function useDatabaseTables() {
  return adminConfig.database?.tables || {};
}
