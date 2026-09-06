import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import Login from '../pages/Login'
import Unauthorized from '../pages/Unauthorized'
import PlaceholderPage from '../pages/PlaceholderPage'
import UserManagement from '../pages/admin/UserManagement'
import MyProfile from '../pages/MyProfile'
import Dashboard from '../pages/Dashboard'
import EmployeeList from '../pages/employees/EmployeeList'
import EmployeeDetail from '../pages/employees/EmployeeDetail'
import EmployeeForm from '../pages/employees/EmployeeForm'
import ContractList from '../pages/contracts/ContractList'
import ContractDetail from '../pages/contracts/ContractDetail'
import MyAttendance from '../pages/employee/MyAttendance'
import MyAttendancePage from '../pages/employee/MyAttendancePage'
import MyPayslips from '../pages/employee/MyPayslips'
import MyTimeOff from '../pages/employee/MyTimeOff'
import MyContract from '../pages/employee/MyContract'
import ExplainMySalary from '../pages/employee/ExplainMySalary'
import TimeOffManagement from '../pages/timeoff/TimeOffManagement'
import AttendanceList from '../pages/attendance/AttendanceList'
import PayrollList from '../pages/payroll/PayrollList'
import PayrollDetail from '../pages/payroll/PayrollDetail'
import EmployeePayrollDetail from '../pages/payroll/EmployeePayrollDetail'
import SalaryRules from '../pages/salary/SalaryRules'
import SalaryStructures from '../pages/salary/SalaryStructures'
import { ROLES } from '../utils/constants'

const ALL_ROLES = [ROLES.ADMIN, ROLES.HR, ROLES.PAYROLL_USER, ROLES.PAYROLL_MANAGER, ROLES.EMPLOYEE]
const ADMIN_ONLY = [ROLES.ADMIN]
const ADMIN_AND_PAYROLL_MANAGER = [ROLES.ADMIN, ROLES.PAYROLL_MANAGER]
const ADMIN_PAYROLL = [ROLES.ADMIN, ROLES.PAYROLL_USER, ROLES.PAYROLL_MANAGER]
const MANAGER_ROLES = [ROLES.ADMIN, ROLES.HR, ROLES.PAYROLL_USER, ROLES.PAYROLL_MANAGER]

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<ProtectedRoute allowedRoles={MANAGER_ROLES} />}>
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="/contracts" element={<ContractList />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/time-off" element={<TimeOffManagement />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ADMIN_PAYROLL} />}>
            <Route path="/payroll" element={<PayrollList />} />
            <Route path="/payroll/employee/:userId" element={<EmployeePayrollDetail />} />
            <Route path="/payroll/:id" element={<PayrollDetail />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ADMIN_AND_PAYROLL_MANAGER} />}>
            <Route path="/salary-structures" element={<SalaryStructures />} />
            <Route path="/salary-rules" element={<SalaryRules />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ADMIN_ONLY} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/my-attendance" element={<MyAttendancePage />} />
            <Route path="/my-time-off" element={<MyTimeOff />} />
            <Route path="/my-payslips" element={<MyPayslips />} />
            <Route path="/my-contract" element={<MyContract />} />
            <Route path="/explain-my-salary" element={<ExplainMySalary />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
