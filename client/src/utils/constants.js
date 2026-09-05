export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr_manager',
  PAYROLL_USER: 'payroll_user',
  PAYROLL_MANAGER: 'payroll_manager',
  EMPLOYEE: 'employee'
}

export const roleLabels = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.HR]: 'HR Manager',
  [ROLES.PAYROLL_USER]: 'Payroll User',
  [ROLES.PAYROLL_MANAGER]: 'Payroll Manager',
  [ROLES.EMPLOYEE]: 'Employee'
}

export function getRoleBadgeClass(role) {
  const map = {
    [ROLES.ADMIN]: 'bg-red-100 text-red-700',
    [ROLES.HR]: 'bg-purple-100 text-purple-700',
    [ROLES.PAYROLL_USER]: 'bg-amber-100 text-amber-700',
    [ROLES.PAYROLL_MANAGER]: 'bg-orange-100 text-orange-700',
    [ROLES.EMPLOYEE]: 'bg-blue-100 text-blue-700'
  }
  return map[role] || 'bg-slate-100 text-slate-700'
}
