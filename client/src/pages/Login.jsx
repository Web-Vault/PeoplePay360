import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { Card } from '../components/common/Card'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const showToast = (msg) => {
    alert(msg)
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PeoplePay360</span>
            </div>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Modern HR & Payroll, Simplified.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              End-to-end employee management, contract tracking, attendance, time off, and payroll — unified in one secure enterprise platform.
            </p>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-white">Secure by default</div>
                <div>Role-based access and JWT sessions</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} PeoplePay360. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">PeoplePay360</span>
          </div>

          <Card className="shadow-xl border-slate-200/80">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h1>
                <p className="text-slate-500 text-sm">Sign in to access your dashboard.</p>
              </div>

              {serverError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={update('email')}
                  errors={errors.email}
                  required
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  icon={Lock}
                  rightIcon={showPw ? EyeOff : Eye}
                  onRightIconClick={() => setShowPw((s) => !s)}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={update('password')}
                  errors={errors.password}
                  required
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Password reset will be available soon.')}
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Sign In
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure authentication • JWT encrypted session
              </div>
            </div>
          </Card>

          <p className="mt-8 text-center text-xs text-slate-400">
            Having trouble? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
