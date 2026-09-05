import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import Login from '../pages/Login'
import Unauthorized from '../pages/Unauthorized'
import PlaceholderPage from '../pages/PlaceholderPage'
import { ROLES } from '../utils/constants'

const ALL_ROLES = [ROLES.ADMIN, ROLES.HR, ROLES.PAYROLL_USER, ROLES.PAYROLL_MANAGER, ROLES.EMPLOYEE]
const ADMIN_AND_PAYROLL_MANAGER = [ROLES.ADMIN, ROLES.PAYROLL_MANAGER]
const ADMIN_PAYROLL = [ROLES.ADMIN, ROLES.PAYROLL_USER, ROLES.PAYROLL_MANAGER]
const ADMIN_HR = [ROLES.ADMIN, ROLES.HR]

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.PAYROLL_USER, ROLES.PAYROLL_MANAGER]}
              />
            }
          >
            <Route path="/employees" element={<PlaceholderPage title="Employees" />} />
            <Route path="/contracts" element={<PlaceholderPage title="Contracts" />} />
            <Route path="/attendance" element={<PlaceholderPage title="Attendance" />} />
            <Route path="/time-off" element={<PlaceholderPage title="Time Off" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ADMIN_PAYROLL} />}>
            <Route path="/payroll" element={<PlaceholderPage title="Payroll" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ADMIN_AND_PAYROLL_MANAGER} />}>
            <Route path="/salary-structures" element={<PlaceholderPage title="Salary Structures" />} />
            <Route path="/salary-rules" element={<PlaceholderPage title="Salary Rules" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ...ALL_ROLES]} />}>
            <Route path="/my-profile" element={<PlaceholderPage title="My Profile" />} />
            <Route path="/my-attendance" element={<PlaceholderPage title="My Attendance" />} />
            <Route path="/my-time-off" element={<PlaceholderPage title="My Time Off" />} />
            <Route path="/my-payslips" element={<PlaceholderPage title="My Payslips" />} />
            <Route path="/explain-my-salary" element={<PlaceholderPage title="Explain My Salary" />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
