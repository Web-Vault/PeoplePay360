import { useEffect, useState } from 'react'
import { getMyAttendance } from '../../services/attendanceService'
import { formatDate } from '../../utils/helpers'

export default function MyAttendanceHistory() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); const [items, setItems] = useState([])
  useEffect(() => { const [year, number] = month.split('-').map(Number); getMyAttendance({ from: `${month}-01`, to: new Date(year, number, 0).toISOString().slice(0, 10) }).then((r) => setItems(r.data.attendance || [])) }, [month])
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Monthly attendance</h2><p className="text-sm text-slate-500">Your daily hours, sessions, and overtime.</p></div><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-fit rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div><div className="mt-4 divide-y divide-slate-100">{items.map((item) => <div key={item._id} className="flex justify-between py-3 text-sm"><div><b>{formatDate(item.date)}</b><p className="text-xs text-slate-500">{item.sessions?.length || 0} sessions · {item.overtimeChoice || 'No OT choice'}</p></div><div className="text-right"><b>{Number(item.workedHours || 0).toFixed(2)}h</b><p className="text-xs text-amber-700">OT {Number(item.overtimeHours || 0).toFixed(2)}h</p></div></div>)}{!items.length && <p className="py-8 text-center text-sm text-slate-500">No attendance for this month.</p>}</div></section>
}
