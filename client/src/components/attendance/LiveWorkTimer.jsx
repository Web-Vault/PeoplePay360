import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

const duration = (from, now) => {
  const seconds = Math.max(0, Math.floor((now - new Date(from).getTime()) / 1000))
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${secs}`
}

export default function LiveWorkTimer({ startedAt, todayHours = 0 }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  if (!startedAt) return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /><span className="text-sm font-semibold">Not clocked in — time is not being tracked</span></div><div className="mt-3 flex items-end justify-between"><div><p className="font-mono text-3xl font-bold tracking-tight text-slate-800">00:00:00</p><p className="mt-1 text-sm text-slate-500">Check in to start your work-hour counter.</p></div><div className="text-right"><Clock3 className="ml-auto h-5 w-5 text-slate-500" /><p className="mt-1 text-sm font-semibold text-slate-800">{Number(todayHours).toFixed(2)} hrs</p><p className="text-xs text-slate-500">completed today</p></div></div></div>
  const current = Math.max(0, (now - new Date(startedAt).getTime()) / 3600000)
  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><div className="flex items-center gap-2 text-emerald-700"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /><span className="text-sm font-semibold">Working now — time is being tracked</span></div><div className="mt-3 flex items-end justify-between gap-3"><div><p className="font-mono text-3xl font-bold tracking-tight text-emerald-900">{duration(startedAt, now)}</p><p className="mt-1 text-sm text-emerald-700">Current session since {new Date(startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div><div className="text-right"><Clock3 className="ml-auto h-5 w-5 text-emerald-600" /><p className="mt-1 text-sm font-semibold text-emerald-900">{(Number(todayHours) + current).toFixed(2)} hrs</p><p className="text-xs text-emerald-700">running total today</p></div></div></div>
}
