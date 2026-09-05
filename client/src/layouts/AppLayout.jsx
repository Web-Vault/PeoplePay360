import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES, roleLabels, getRoleBadgeClass } from '../utils/constants'
import { cn } from '../utils/helpers'
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  CalendarDays,
  Wallet,
  Coins,
  BarChart3,
  FileBarChart2,
  User,
  Shield,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserCog
} from 'lucide-react'

const iconMap = {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  CalendarDays,
  Wallet,
  Coins,
  BarChart3,
  FileBarChart2,
  User,
  Shield,
  UserCog
}

function getNavItems(role) {
  switch (role) {
    case ROLES.ADMIN:
      return [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'User Management', path: '/users', icon: 'UserCog' },
        { label: 'Employees', path: '/employees', icon: 'Users' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Attendance', path: '/attendance', icon: 'Clock' },
        { label: 'Time Off', path: '/time-off', icon: 'CalendarDays' },
        { label: 'Payroll', path: '/payroll', icon: 'Wallet' },
        { label: 'Salary Structures', path: '/salary-structures', icon: 'Coins' },
        { label: 'Salary Rules', path: '/salary-rules', icon: 'BarChart3' },
        { label: 'Reports', path: '/reports', icon: 'FileBarChart2' }
      ]
    case ROLES.HR:
      return [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Employees', path: '/employees', icon: 'Users' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Attendance', path: '/attendance', icon: 'Clock' },
        { label: 'Time Off', path: '/time-off', icon: 'CalendarDays' }
      ]
    case ROLES.PAYROLL_USER:
      return [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Employees', path: '/employees', icon: 'Users' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Attendance', path: '/attendance', icon: 'Clock' },
        { label: 'Time Off', path: '/time-off', icon: 'CalendarDays' },
        { label: 'Payroll', path: '/payroll', icon: 'Wallet' }
      ]
    case ROLES.PAYROLL_MANAGER:
      return [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Employees', path: '/employees', icon: 'Users' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Attendance', path: '/attendance', icon: 'Clock' },
        { label: 'Time Off', path: '/time-off', icon: 'CalendarDays' },
        { label: 'Payroll', path: '/payroll', icon: 'Wallet' },
        { label: 'Salary Structures', path: '/salary-structures', icon: 'Coins' },
        { label: 'Salary Rules', path: '/salary-rules', icon: 'BarChart3' },
        { label: 'Reports', path: '/reports', icon: 'FileBarChart2' }
      ]
    case ROLES.EMPLOYEE:
    default:
      return [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'My Profile', path: '/my-profile', icon: 'User' },
        { label: 'My Attendance', path: '/my-attendance', icon: 'Clock' },
        { label: 'My Time Off', path: '/my-time-off', icon: 'CalendarDays' },
        { label: 'My Payslips', path: '/my-payslips', icon: 'FileText' },
        { label: 'Explain My Salary', path: '/explain-my-salary', icon: 'Coins' }
      ]
  }
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = getNavItems(user?.role)
  const roleLabel = roleLabels[user?.role] || 'User'
  const roleBadge = getRoleBadgeClass(user?.role)

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  const displayName = user?.full_name || user?.name || user?.email || 'User'

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            PeoplePay360
          </span>
          <button
            type="button"
            className="lg:hidden ml-auto text-slate-400 hover:text-slate-600"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {displayName}
              </div>
              <div>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', roleBadge)}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                    )}
                  />
                )}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="h-full flex items-center px-4 sm:px-6 lg:px-8 gap-4">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-3 rounded-lg p-1.5 pr-3 hover:bg-slate-50 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">
                    {displayName}
                  </div>
                  <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium', roleBadge)}>
                    {roleLabel}
                  </span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {displayName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {user?.email || ''}
                          </div>
                          <div className="mt-1">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', roleBadge)}>
                              {roleLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          navigate('/my-profile')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        My Profile
                      </button>
                      <div className="my-1 h-px bg-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
