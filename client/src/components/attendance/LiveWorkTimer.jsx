import { useEffect, useState } from 'react'
import { Clock3, IndianRupee } from 'lucide-react'
import { getToday } from '../../services/attendanceService'

const duration = (from, now) => {
  const seconds = Math.max(0, Math.floor((now - new Date(from).getTime()) / 1000))
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export default function LiveWorkTimer({ startedAt, todayHours = 0, payPerMinute = 0 }) {
  const [now, setNow] = useState(Date.now())
  const [rateFromServer, setRateFromServer] = useState(0)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  useEffect(() => { getToday().then((response) => setRateFromServer(response.data?.payPerMinute || 0)).catch(() => {}) }, [])
  const rate = `₹${Number(payPerMinute || rateFromServer).toFixed(2)} / min`

  if (!startedAt) return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /><span className="text-sm font-semibold">Not clocked in — time is not being tracked</span></div><div className="mt-3 flex items-end justify-between gap-3"><div><p className="font-mono text-3xl font-bold tracking-tight text-slate-800">00:00:00</p><p className="mt-1 text-sm text-slate-500">Check in to start your work-hour counter.</p></div><div className="text-right"><IndianRupee className="ml-auto h-5 w-5 text-slate-500" /><p className="mt-1 text-sm font-semibold text-slate-800">{rate}</p><p className="text-xs text-slate-500">regular-time pay rate</p></div></div></div>

  const current = Math.max(0, (now - new Date(startedAt).getTime()) / 3600000)
  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><div className="flex items-center gap-2 text-emerald-700"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /><span className="text-sm font-semibold">Working now — time is being tracked</span></div><div className="mt-3 flex items-end justify-between gap-3"><div><p className="font-mono text-3xl font-bold tracking-tight text-emerald-900">{duration(startedAt, now)}</p><p className="mt-1 text-sm text-emerald-700">Current session since {new Date(startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div><div className="text-right"><IndianRupee className="ml-auto h-5 w-5 text-emerald-600" /><p className="mt-1 text-sm font-semibold text-emerald-900">{rate}</p><p className="text-xs text-emerald-700">regular-time pay rate</p></div></div><div className="mt-4 border-t border-emerald-200 pt-3 text-right"><Clock3 className="mr-1 inline h-4 w-4" /><span className="text-sm font-semibold text-emerald-900">{(Number(todayHours) + current).toFixed(2)} hrs</span><span className="ml-2 text-xs text-emerald-700">running total today</span></div></div>
}
