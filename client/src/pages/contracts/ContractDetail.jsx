import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, Pencil, RefreshCw, Save, Wallet } from 'lucide-react'
import Button from '../../components/common/Button'
import { getContract, renewContract, updateContract } from '../../services/contractService'
import { useAuth } from '../../context/AuthContext'

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(value || 0)

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'Ongoing'

const workDuration = (start = '09:00', end = '18:00', breakMinutes = 0) => {
  const [startHours, startMinutes] = start.split(':').map(Number)
  const [endHours, endMinutes] = end.split(':').map(Number)
  const totalMinutes = Math.max(0, endHours * 60 + endMinutes - startHours * 60 - startMinutes - Number(breakMinutes))
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}m`
}

function SalaryRow({ label, value, red = false }) {
  return <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">{label}</span><b className={red ? 'text-red-600' : 'text-slate-900'}>{money(value)}</b></div>
}

function RenewalDialog({ contract, onClose, onRenewed }) {
  const defaultStart = contract.endDate
    ? new Date(new Date(contract.endDate).getTime() + 86400000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await renewContract(contract._id, {
        startDate,
        endDate: endDate || null,
        revisionReason: 'Contract renewal'
      })
      onRenewed(response.data.contract._id)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not renew contract')
    } finally {
      setSaving(false)
    }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/50" />
    <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-bold">Renew contract</h2>
      <p className="mt-1 text-sm text-slate-500">Creates a new active contract and keeps this contract as history.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="mt-4 block text-sm font-medium">New start date<input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <label className="mt-4 block text-sm font-medium">New end date (optional)<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <div className="mt-5 flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={saving}><RefreshCw className="h-4 w-4" />Renew</Button></div>
    </form>
  </div>
}

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = ['admin', 'payroll_manager'].includes(user?.role)
  const [contract, setContract] = useState(null)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const response = await getContract(id)
      const item = response.data.contract
      setContract(item)
      setForm({
        basicSalary: item.basicSalary || 0,
        overtimeRate: item.overtimeRate || 0,
        workStartTime: item.workStartTime || '09:00',
        workEndTime: item.workEndTime || '18:00',
        breakMinutes: item.breakMinutes ?? 60,
        position: item.position || '',
        status: item.status,
        revisionReason: item.revisionReason || ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load contract')
    }
  }

  useEffect(() => { load() }, [id])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateContract(id, form)
      setEditing(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save contract')
    } finally {
      setSaving(false)
    }
  }

  if (error && !contract) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
  if (!contract || !form) return <p className="py-20 text-center text-sm text-slate-500">Loading contract…</p>

  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link to="/contracts" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" />Contracts</Link>
        <h1 className="mt-3 text-2xl font-bold">{contract.userId?.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{contract.contractNumber} · {contract.position || contract.userId?.position}</p>
      </div>
      {canEdit && <div className="flex gap-2"><Button variant="secondary" onClick={() => setRenewing(true)}><RefreshCw className="h-4 w-4" />Renew</Button><Button onClick={() => setEditing((value) => !value)}><Pencil className="h-4 w-4" />{editing ? 'Cancel' : 'Edit contract'}</Button></div>}
    </div>
    {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="flex items-center gap-2 font-semibold"><Wallet className="h-5 w-5 text-primary-600" />Salary terms</h2>
        {editing ? <form onSubmit={save} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Base monthly salary<input required min="0" type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm font-medium">Overtime pay per hour<input required min="0" type="number" value={form.overtimeRate} onChange={(e) => setForm({ ...form, overtimeRate: Number(e.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm font-medium">Position<input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm font-medium">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2">{['draft', 'active', 'expired', 'terminated'].map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <section className="rounded-xl border border-blue-200 bg-blue-50/40 p-4"><h3 className="font-semibold">Working terms</h3><p className="mt-1 text-xs text-slate-500">These terms determine the daily limit used for overtime.</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-sm">Start time<input required type="time" value={form.workStartTime} onChange={(e) => setForm({ ...form, workStartTime: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-sm">End time<input required type="time" value={form.workEndTime} onChange={(e) => setForm({ ...form, workEndTime: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-sm">Break (minutes)<input required min="0" max="480" type="number" value={form.breakMinutes} onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></div><p className="mt-3 font-semibold text-blue-800">Net daily working time: {workDuration(form.workStartTime, form.workEndTime, form.breakMinutes)}</p></section>
          <label className="block text-sm font-medium">Revision note<textarea value={form.revisionReason} onChange={(e) => setForm({ ...form, revisionReason: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
          <div className="flex justify-end"><Button type="submit" loading={saving}><Save className="h-4 w-4" />Save contract</Button></div>
        </form> : <div className="mt-4 divide-y"><SalaryRow label="Base monthly salary" value={contract.basicSalary} />{contract.pay?.allowances?.map((item, index) => <SalaryRow key={index} label={item.name} value={item.amount} />)}<div className="flex justify-between py-3 font-bold"><span>Gross salary</span><span>{money(contract.pay?.gross)}</span></div>{contract.pay?.deductions?.map((item, index) => <SalaryRow key={index} label={item.name} value={item.amount} red />)}<div className="flex justify-between py-3 font-bold text-emerald-700"><span>Net monthly pay</span><span>{money(contract.pay?.net)}</span></div></div>}
      </section>
      <aside className="space-y-4"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-semibold"><Clock3 className="h-5 w-5 text-primary-600" />Working terms</h2><div className="mt-4 space-y-3 text-sm"><p className="text-slate-500">Daily schedule<br /><b className="text-slate-900">{contract.workStartTime || '09:00'} – {contract.workEndTime || '18:00'}</b></p><p className="text-slate-500">Break<br /><b className="text-slate-900">{contract.breakMinutes ?? 60} minutes</b></p><p className="text-slate-500">Net work time<br /><b className="text-slate-900">{workDuration(contract.workStartTime, contract.workEndTime, contract.breakMinutes)}</b></p><p className="text-slate-500">Overtime pay<br /><b className="text-slate-900">{money(contract.overtimeRate)} / hour</b></p></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm"><p className="text-slate-500">Contract period</p><b>{formatDate(contract.startDate)} – {formatDate(contract.endDate)}</b></section></aside>
    </div>
    {renewing && <RenewalDialog contract={contract} onClose={() => setRenewing(false)} onRenewed={(newId) => navigate(`/contracts/${newId}`)} />}
  </div>
}
