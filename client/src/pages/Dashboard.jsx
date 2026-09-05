import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet
} from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listUsers } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { roleLabels } from '../utils/constants'
import { formatDate } from '../utils/helpers'
import { getDashboard } from '../services/selfService'
import { ROLES } from '../utils/constants'

const payroll = {
  period: 'August 2026',
  employees: 10,
  gross: 1180000,
  deductions: 180000,
  net: 1000000,
  auditScore: 92,
  warnings: 3
}

const formatINR = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(value)

const initials = (name = '') => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U'

function MetricCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600'
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{detail}</p>
    </div>
  )
}

function Skeleton() {
  return <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-4 w-24 rounded bg-slate-100" /><div className="mt-4 h-8 w-16 rounded bg-slate-100" /><div className="mt-4 h-3 w-32 rounded bg-slate-100" /></div>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [employeeSummary, setEmployeeSummary] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listUsers({ limit: 100 })
      setUsers(response?.data?.users || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Account activity could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === ROLES.EMPLOYEE) {
      getDashboard().then((response) => setEmployeeSummary(response.data)).catch((err) => setError(err.response?.data?.message || 'Could not load your dashboard.')).finally(() => setLoading(false))
    } else loadUsers()
  }, [])

  const activeUsers = users.filter((account) => account.isActive).length
  const recentUsers = users.slice(0, 5)
  const roleData = useMemo(() => {
    const counts = users.reduce((all, account) => {
      const label = roleLabels[account.role] || 'Other'
      all[label] = (all[label] || 0) + 1
      return all
    }, {})
    return Object.entries(counts).map(([name, total]) => ({ name: name.replace(' Manager', ''), total }))
  }, [users])

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  if (user?.role === ROLES.EMPLOYEE) return <div className="space-y-6"><section className="rounded-2xl bg-slate-900 p-7 text-white shadow-lg"><p className="text-sm text-blue-200">Your work overview</p><h1 className="mt-2 text-3xl font-bold">{greeting}, {user?.name?.split(' ')[0]}.</h1><p className="mt-2 text-sm text-slate-300">Your attendance, overtime, leave, and latest pay—only your own data.</p></section>{error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<section className="grid gap-4 sm:grid-cols-3"><MetricCard icon={Clock3} label="Worked today" value={`${employeeSummary?.today?.workedHours || 0} hrs`} detail="Across all sessions" /><MetricCard icon={Banknote} label="Overtime today" value={`${employeeSummary?.today?.overtimeHours || 0} hrs`} detail="Cash or comp time eligible" tone="amber" /><MetricCard icon={Wallet} label="Daily earnings" value={formatINR(employeeSummary?.today?.dailyEarnings || 0)} detail="Based on latest payslip" tone="emerald" /></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Latest payslip</h2>{employeeSummary?.latestPayslip ? <div className="mt-4 flex items-center justify-between"><div><p className="font-medium text-slate-800">{formatDate(employeeSummary.latestPayslip.periodStart)} – {formatDate(employeeSummary.latestPayslip.periodEnd)}</p><p className="text-sm text-slate-500">Deductions: {formatINR(employeeSummary.latestPayslip.totalDeductions)}</p></div><p className="text-xl font-bold text-slate-900">{formatINR(employeeSummary.latestPayslip.netSalary)}</p></div> : <p className="mt-3 text-sm text-slate-500">No payslip issued yet.</p>}</section></div>

  return (
    <div className="space-y-6 pb-5">
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-200"><span className="h-2 w-2 rounded-full bg-emerald-400" />System overview</div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}, {user?.name?.split(' ')[0] || 'Admin'}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Here’s a clear view of your people operations and the latest payroll cycle.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200 backdrop-blur-sm"><CalendarDays className="h-4 w-4 text-blue-300" />{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </section>

      {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={loadUsers} className="font-semibold hover:text-amber-950">Try again</button></div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? <><Skeleton /><Skeleton /><Skeleton /><Skeleton /></> : <>
          <MetricCard icon={Users} label="User accounts" value={users.length} detail={`${activeUsers} active account${activeUsers === 1 ? '' : 's'}`} />
          <MetricCard icon={ShieldCheck} label="Active access" value={activeUsers} detail={`${users.length - activeUsers} account${users.length - activeUsers === 1 ? '' : 's'} inactive`} tone="emerald" />
          <MetricCard icon={Wallet} label="Net payroll" value={formatINR(payroll.net)} detail={`${payroll.employees} employees in current run`} tone="violet" />
          <MetricCard icon={FileCheck2} label="Payroll audit" value={`${payroll.auditScore}%`} detail={`${payroll.warnings} items need a review`} tone="amber" />
        </>}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-base font-semibold text-slate-900">Access by role</p><p className="mt-1 text-sm text-slate-500">Distribution of available platform accounts</p></div>
            <Link to="/users" className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex">Manage users <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-6 h-56">
            {roleData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={roleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} /><Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15,23,42,.08)' }} /><Bar dataKey="total" name="Accounts" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={46} /></BarChart></ResponsiveContainer> : <div className="flex h-full flex-col items-center justify-center text-sm text-slate-400"><Users className="mb-3 h-8 w-8 text-slate-300" />No account data available</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-base font-semibold text-slate-900">Payroll pulse</p><p className="mt-1 text-sm text-slate-500">{payroll.period} monthly payrun</p></div><div className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><Landmark className="h-5 w-5" /></div></div>
          <div className="mt-6 space-y-4">
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-500">Gross salary</span><span className="font-semibold text-slate-900">{formatINR(payroll.gross)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-full rounded-full bg-blue-500" /></div></div>
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-500">Deductions</span><span className="font-semibold text-slate-900">{formatINR(payroll.deductions)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(payroll.deductions / payroll.gross) * 100}%` }} /></div></div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3"><span className="text-sm font-medium text-emerald-800">Ready to disburse</span><span className="font-bold text-emerald-700">{formatINR(payroll.net)}</span></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="text-base font-semibold text-slate-900">Recent account activity</p><p className="mt-1 text-sm text-slate-500">Most recently created platform accounts</p></div><button onClick={loadUsers} disabled={loading} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" aria-label="Refresh account activity"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
          <div className="divide-y divide-slate-100">
            {!loading && recentUsers.map((account) => <div className="flex items-center gap-3 px-5 py-3.5 sm:px-6" key={account.id}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{initials(account.name)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{account.name}</p><p className="truncate text-xs text-slate-500">{account.email}</p></div><div className="text-right"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${account.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{account.isActive ? 'Active' : 'Inactive'}</span><p className="mt-1 text-[11px] text-slate-400">{account.createdAt ? formatDate(account.createdAt) : roleLabels[account.role]}</p></div></div>)}
            {!loading && !recentUsers.length && <p className="px-6 py-10 text-center text-sm text-slate-400">No account activity to show.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><Clock3 className="h-5 w-5" /></div><div><p className="font-semibold text-slate-900">Needs attention</p><p className="text-sm text-slate-500">Keep the cycle moving</p></div></div><div className="mt-6 space-y-3"><div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p className="text-sm leading-5 text-amber-900"><strong>{payroll.warnings} payroll checks</strong> are waiting for review before validation.</p></div><div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><p className="text-sm leading-5 text-emerald-900">No critical payroll issues were found in the latest audit.</p></div></div><Link to="/payroll" className="mt-5 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Review payroll <ChevronRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  )
}
