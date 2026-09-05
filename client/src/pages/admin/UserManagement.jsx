import { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  KeyRound,
  X,
  Mail,
  User,
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import { ROLES, roleLabels, getRoleBadgeClass } from '../../utils/constants'
import { cn, formatDate, truncate } from '../../utils/helpers'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
} from '../../services/userService'

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: roleLabels[ROLES.ADMIN] },
  { value: ROLES.HR, label: roleLabels[ROLES.HR] },
  { value: ROLES.PAYROLL_USER, label: roleLabels[ROLES.PAYROLL_USER] },
  { value: ROLES.PAYROLL_MANAGER, label: roleLabels[ROLES.PAYROLL_MANAGER] },
  { value: ROLES.EMPLOYEE, label: roleLabels[ROLES.EMPLOYEE] }
]

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: ROLES.EMPLOYEE,
  isActive: true,
  phone: '',
  employeeId: ''
}

function Modal({ open, title, onClose, children, size = 'md' }) {
  if (!open) return null
  const sizeClass =
    size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn('relative w-full', sizeClass)}>
        <Card className="shadow-2xl border-slate-200/80 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -m-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <div className="px-6 pb-6">{children}</div>
        </Card>
      </div>
    </div>
  )
}

function validateForm(f, isCreate = true) {
  const e = {}
  if (!f.name?.trim()) e.name = 'Name is required'
  else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters'

  if (!f.email?.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Please enter a valid email'

  if (isCreate) {
    if (!f.password) e.password = 'Password is required'
    else {
      if (f.password.length < 8) e.password = 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(f.password)) e.password = (e.password || '') + (e.password ? ' • ' : '') + 'Uppercase letter required'
      if (!/[a-z]/.test(f.password)) e.password = (e.password || '') + (e.password ? ' • ' : '') + 'Lowercase letter required'
      if (!/[0-9]/.test(f.password)) e.password = (e.password || '') + (e.password ? ' • ' : '') + 'Number required'
    }
  }
  if (!f.role) e.role = 'Role is required'
  return e
}

function validatePassword(pw) {
  const e = {}
  if (!pw) e.newPassword = 'Password is required'
  else {
    if (pw.length < 8) e.newPassword = 'Must be at least 8 characters'
    if (!/[A-Z]/.test(pw)) e.newPassword = (e.newPassword || '') + (e.newPassword ? ' • ' : '') + 'Uppercase required'
    if (!/[a-z]/.test(pw)) e.newPassword = (e.newPassword || '') + (e.newPassword ? ' • ' : '') + 'Lowercase required'
    if (!/[0-9]/.test(pw)) e.newPassword = (e.newPassword || '') + (e.newPassword ? ' • ' : '') + 'Number required'
  }
  return e
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [toast, setToast] = useState(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const [form, setForm] = useState({ ...emptyForm })
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const [targetUser, setTargetUser] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetErrors, setResetErrors] = useState({})
  const [resetLoading, setResetLoading] = useState(false)
  const [showResetPw, setShowResetPw] = useState(false)

  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (activeFilter) params.isActive = activeFilter
      const result = await listUsers(params)
      setUsers(result?.data?.users || [])
      setPagination(result?.data?.pagination || pagination)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load users'
      showToast('error', msg)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, roleFilter, activeFilter, showToast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openCreate = () => {
    setForm({ ...emptyForm })
    setFormErrors({})
    setShowPw(false)
    setCreateOpen(true)
  }

  const openEdit = (u) => {
    setTargetUser(u)
    setForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || ROLES.EMPLOYEE,
      isActive: u.isActive !== false,
      phone: u.phone || '',
      employeeId: u.employeeId?.$oid || u.employeeId?._id || ''
    })
    setFormErrors({})
    setEditOpen(true)
  }

  const openDelete = (u) => {
    setTargetUser(u)
    setDeleteOpen(true)
  }

  const openReset = (u) => {
    setTargetUser(u)
    setResetPassword('')
    setResetErrors({})
    setShowResetPw(false)
    setResetOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errors = validateForm(form, true)
    setFormErrors(errors)
    if (Object.keys(errors).length) return
    setFormLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        isActive: form.isActive,
        phone: form.phone || undefined,
        employeeId: form.employeeId || undefined
      }
      await createUser(payload)
      showToast('success', 'User created successfully')
      setCreateOpen(false)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user'
      const fieldErrors = err.response?.data?.errors
      if (Array.isArray(fieldErrors)) {
        const map = {}
        fieldErrors.forEach((er) => { if (er.path) map[er.path] = er.msg })
        setFormErrors((p) => ({ ...p, ...map }))
      } else {
        setFormErrors({ _server: msg })
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    const errors = validateForm(form, false)
    setFormErrors(errors)
    if (Object.keys(errors).length) return
    setFormLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        isActive: form.isActive,
        phone: form.phone || undefined,
        employeeId: form.employeeId || undefined
      }
      await updateUser(targetUser.id || targetUser._id, payload)
      showToast('success', 'User updated successfully')
      setEditOpen(false)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user'
      const fieldErrors = err.response?.data?.errors
      if (Array.isArray(fieldErrors)) {
        const map = {}
        fieldErrors.forEach((er) => { if (er.path) map[er.path] = er.msg })
        setFormErrors((p) => ({ ...p, ...map }))
      } else {
        setFormErrors({ _server: msg })
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await deleteUser(targetUser.id || targetUser._id)
      showToast('success', 'User deleted successfully')
      setDeleteOpen(false)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user'
      setFormErrors({ _server: msg })
    } finally {
      setFormLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    const errors = validatePassword(resetPassword)
    setResetErrors(errors)
    if (Object.keys(errors).length) return
    setResetLoading(true)
    try {
      await resetUserPassword(targetUser.id || targetUser._id, resetPassword)
      showToast('success', 'Password reset successfully')
      setResetOpen(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password'
      setResetErrors({ _server: msg })
    } finally {
      setResetLoading(false)
    }
  }

  const setPage = (p) => setPagination((prev) => ({ ...prev, page: p }))
  const setLimit = (l) => setPagination((prev) => ({ ...prev, page: 1, limit: l }))

  const totalPages = pagination.pages || 0
  const p = pagination.page || 1

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-[60] max-w-sm">
          <div className={cn(
            'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border',
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}>
            {toast.type === 'success'
              ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              : <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Create, edit, and manage platform users and permissions.</p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="h-4 w-4" />
          New User
        </Button>
      </div>

      <Card>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Search name, email or phone..."
                icon={Search}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={activeFilter}
                onChange={(e) => { setActiveFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>

        <div className="overflow-x-auto border-t border-slate-100">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No users found</p>
                      <p className="text-xs text-slate-500">Try adjusting your filters or create a new user.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const uid = u.id || u._id
                  const roleBadge = getRoleBadgeClass(u.role)
                  const rLabel = roleLabels[u.role] || 'User'
                  return (
                    <tr key={uid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {(u.name || u.email || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {truncate(u.name, 30)}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleBadge)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {rLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {u.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {u.phone}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 rounded-full px-2.5 py-0.5">
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {u.lastLogin ? formatDate(u.lastLogin, { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="p-2 rounded-lg text-slate-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            title="Edit user"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openReset(u)}
                            className="p-2 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(u)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Show</span>
            <select
              value={pagination.limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>of {pagination.total || 0} users</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={p <= 1}
              onClick={() => setPage(p - 1)}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-3 py-2 text-sm font-medium text-slate-700">
              Page {p} of {totalPages || 1}
            </div>
            <button
              type="button"
              disabled={p >= totalPages}
              onClick={() => setPage(p + 1)}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      <Modal
        open={createOpen}
        title="Create New User"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formErrors._server && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formErrors._server}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" icon={User} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} errors={formErrors.name} required />
            <Input label="Email Address" name="email" type="email" icon={Mail} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} errors={formErrors.email} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <Input label="Phone (optional)" name="phone" icon={Phone} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} errors={formErrors.phone} />
          </div>
          <Input
            label="Initial Password"
            name="password"
            type={showPw ? 'text' : 'password'}
            icon={KeyRound}
            rightIcon={showPw ? EyeOff : Eye}
            onRightIconClick={() => setShowPw((s) => !s)}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            errors={formErrors.password}
            required
            placeholder="Min 8 chars, with upper, lower, number"
          />
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">Account is Active</div>
              <div className="text-xs text-slate-500">Inactive users cannot log in.</div>
            </div>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={formLoading}><Plus className="h-4 w-4" /> Create User</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editOpen}
        title={`Edit User — ${targetUser?.name || ''}`}
        onClose={() => setEditOpen(false)}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {formErrors._server && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formErrors._server}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" icon={User} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} errors={formErrors.name} required />
            <Input label="Email Address" name="email" type="email" icon={Mail} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} errors={formErrors.email} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <Input label="Phone (optional)" name="phone" icon={Phone} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} errors={formErrors.phone} />
          </div>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">Account is Active</div>
              <div className="text-xs text-slate-500">Inactive users cannot log in.</div>
            </div>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" loading={formLoading}><Edit3 className="h-4 w-4" /> Save Changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} title="Delete User" onClose={() => setDeleteOpen(false)} size="sm">
        {formErrors._server && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formErrors._server}</div>
        )}
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 mb-1">
              Are you sure you want to delete <span className="text-red-600">{targetUser?.name}</span>?
            </p>
            <p className="text-sm text-slate-600">
              This action is permanent. The user account ({targetUser?.email}) will be removed and will no longer be able to access the platform.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button type="button" variant="danger" loading={formLoading} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete User
          </Button>
        </div>
      </Modal>

      <Modal
        open={resetOpen}
        title={`Reset Password — ${targetUser?.name || ''}`}
        onClose={() => setResetOpen(false)}
        size="sm"
      >
        <form onSubmit={handleReset} className="space-y-4">
          {resetErrors._server && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{resetErrors._server}</div>
          )}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-3">
            <KeyRound className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Set a new temporary password</p>
              <p className="text-xs text-amber-700 mt-0.5">Share this password with the user securely. They can change it after logging in.</p>
            </div>
          </div>
          <Input
            label="New Password"
            name="newPassword"
            type={showResetPw ? 'text' : 'password'}
            icon={KeyRound}
            rightIcon={showResetPw ? EyeOff : Eye}
            onRightIconClick={() => setShowResetPw((s) => !s)}
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            errors={resetErrors.newPassword}
            required
            placeholder="Min 8 chars, with upper, lower, number"
          />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button type="submit" loading={resetLoading}><KeyRound className="h-4 w-4" /> Reset Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
