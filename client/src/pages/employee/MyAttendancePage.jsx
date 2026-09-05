import MyAttendance from './MyAttendanceLive'
import MyAttendanceHistory from '../../components/attendance/MyAttendanceHistory'

export default function MyAttendancePage() {
  return <div className="space-y-6"><MyAttendance /><div className="mx-auto max-w-5xl"><MyAttendanceHistory /></div></div>
}
