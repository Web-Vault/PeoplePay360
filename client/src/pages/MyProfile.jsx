import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  UserCheck,
  Clock,
  CalendarDays,
  LogOut
} from 'lucide-react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { useAuth } from '../context/AuthContext'
import { roleLabels, getRoleBadgeClass } from '../utils/constants'
import { cn, formatDate } from '../utils/helpers'
import { updateMyProfile, changeMyPassword } from '../services/userService'
import * as authService from '../services/authService'

export default function MyProfile() {
  const { user, token, logout, setUser } = useAuth()
  const navigate = useNavigate()

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileToast, setProfileToast] = useState(null)

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwToast, setPwToast] = useState(null)

  const showPToast = useCallback((type, message) => {
    setProfileToast({ type, message })
    setTimeout(() => setProfileToast(null), 3500)
  }, [])

  const showPWToast = useCallback((type, message) => {
    setPwToast({ type, message })
    setTimeout(() => setPwToast(null), 3500)
  }, [])

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const validateProfile = (f) => {
    const e = {}
    if (!f.name?.trim()) e.name = 'Name is required'
    else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (f.phone && f.phone.length > 20) e.phone = 'Phone must be at most 20 characters'
    return e
  }

  const validatePw = (f) => {
    const e = {}
    if (!f.current) e.current = 'Current password is required'
    if (!f.new) e.new = 'New password is required'
    else {
      if (f.new.length < 8) e.new = (e.new || '') + (e.new ? ' • ' : '') + 'Min 8 characters'
      if (!/[A-Z]/.test(f.new)) e.new = (e.new || '') + (e.new ? ' • ' : '') + 'Uppercase required'
      if (!/[a-z]/.test(f.new)) e.new = (e.new || '') + (e.new ? ' • ' : '') + 'Lowercase required'
      if (!/[0-9]/.test(f.new)) e.new = (e.new || '') + (e.new ? ' • ' : '') + 'Number required'
    }
    if (!f.confirm) e.confirm = 'Please confirm your new password'
    else if (f.confirm !== f.new) e.confirm = 'Passwords do not match'
    if (f.current && f.new && f.current === f.new) {
      e.new = (e.new || '') + (e.new ? ' • ' : '') + 'Must differ from current'
    }
    return e
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const errors = validateProfile(profileForm)
    setProfileErrors(errors)
    if (Object.keys(errors).length) return
    setProfileLoading(true)
    try {
      const result = await updateMyProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone || undefined
      })
      const updated = result?.data?.user || result?.user
      if (updated) {
        setUser(updated)
        authService.storeAuth({ token, user: updated })
      }
      showPToast('success', 'Profile updated successfully')
      setEditingProfile(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile'
      const fieldErrors = err.response?.data?.errors
      if (Array.isArray(fieldErrors)) {
        const map = {}
        fieldErrors.forEach((er) => { if (er.path) map[er.path] = er.msg })
        setProfileErrors((p) => ({ ...p, ...map, _server: undefined }))
        if (!Object.keys(map).length) setProfileErrors({ _server: msg })
      } else {
        setProfileErrors({ _server: msg })
      }
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const errors = validatePw(pwForm)
    setPwErrors(errors)
    if (Object.keys(errors).length) return
    setPwLoading(true)
    try {
      await changeMyPassword(pwForm.current, pwForm.new)
      showPWToast('success', 'Password changed successfully')
      setPwForm({ current: '', new: '', confirm: '' })
      setShowCurrentPw(false)
      setShowNewPw(false)
      setShowConfirmPw(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password'
      setPwErrors({ _server: msg })
    } finally {
      setPwLoading(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  const roleBadge = user ? getRoleBadgeClass(user.role) : 'bg-slate-100 text-slate-700'
  const rLabel = user ? roleLabels[user.role] || 'User' : 'User'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {(profileToast || pwToast) && (
        <div className="fixed top-6 right-6 z-[60] max-w-sm space-y-2">
          {profileToast && (
            <div className={cn(
              'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border',
              profileToast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            )}>
              {profileToast.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <p className="text-sm font-medium">{profileToast.message}</p>
            </div>
          )}
          {pwToast && (
            <div className={cn(
              'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border',
              pwToast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            )}>
              {pwToast.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <p className="text-sm font-medium">{pwToast.message}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your account information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-primary-200 ring-4 ring-white">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
              <div className="mt-3">
                <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleBadge)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {rLabel}
                </span>
              </div>
              <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <UserCheck className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 rounded-full px-2.5 py-0.5">
                      <X className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>Last Login</span>
                  </div>
                  <span className="font-medium text-slate-700 text-xs">
                    {user.lastLogin ? formatDate(user.lastLogin, { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                  <span className="font-medium text-slate-700 text-xs">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                {user.lastPasswordChange && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <KeyRound className="h-4 w-4" />
                      <span>Password</span>
                    </div>
                    <span className="font-medium text-slate-700 text-xs">
                      {formatDate(user.lastPasswordChange)}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-full mt-5">
                <Button variant="danger" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Update your contact and display details.</p>
              </div>
              {!editingProfile && (
                <Button variant="secondary" size="sm" onClick={() => setEditingProfile(true)}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileErrors._server && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{profileErrors._server}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      icon={User}
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      errors={profileErrors.name}
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      icon={Mail}
                      value={user.email}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      name="phone"
                      icon={Phone}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      errors={profileErrors.phone}
                      placeholder="+91 98765 43210 (optional)"
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleBadge)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {rLabel}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">(Contact admin to change)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => { setEditingProfile(false); setProfileErrors({}) }}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={profileLoading}>
                      <CheckCircle2 className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{user.phone || <span className="text-slate-400 font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Role</p>
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleBadge)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {rLabel}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>
                <span className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary-600" />
                  Change Password
                </span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">Keep your account secure by updating your password regularly.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                {pwErrors._server && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {pwErrors._server}
                  </div>
                )}
                <Input
                  label="Current Password"
                  name="current"
                  type={showCurrentPw ? 'text' : 'password'}
                  icon={KeyRound}
                  rightIcon={showCurrentPw ? EyeOff : Eye}
                  onRightIconClick={() => setShowCurrentPw((s) => !s)}
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  errors={pwErrors.current}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    name="new"
                    type={showNewPw ? 'text' : 'password'}
                    icon={KeyRound}
                    rightIcon={showNewPw ? EyeOff : Eye}
                    onRightIconClick={() => setShowNewPw((s) => !s)}
                    value={pwForm.new}
                    onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                    errors={pwErrors.new}
                    required
                    placeholder="Min 8 chars, upper+lower+number"
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    icon={KeyRound}
                    rightIcon={showConfirmPw ? EyeOff : Eye}
                    onRightIconClick={() => setShowConfirmPw((s) => !s)}
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    errors={pwErrors.confirm}
                    required
                  />
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Password requirements:</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', pwForm.new?.length >= 8 ? 'text-emerald-500' : 'text-slate-300')} />
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', /[A-Z]/.test(pwForm.new) ? 'text-emerald-500' : 'text-slate-300')} />
                      Contains an uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', /[a-z]/.test(pwForm.new) ? 'text-emerald-500' : 'text-slate-300')} />
                      Contains a lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', /[0-9]/.test(pwForm.new) ? 'text-emerald-500' : 'text-slate-300')} />
                      Contains a number
                    </li>
                  </ul>
                </div>
                <div className="pt-1">
                  <Button type="submit" loading={pwLoading}>
                    <KeyRound className="h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
