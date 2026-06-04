import { useAuthStore } from '../store/authStore';
import { ROLES } from '../utils/constants';

export const useAuth = () => {
  const { user, setAuth, clearAuth } = useAuthStore();

  const hasRole  = (...roles) => roles.includes(user?.rol);
  const isAdmin  = () => hasRole(ROLES.SUPERADMIN, ROLES.ADMIN);
  const canWrite = () => hasRole(ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INGENIERO);

  return { user, setAuth, clearAuth, hasRole, isAdmin, canWrite };
};
