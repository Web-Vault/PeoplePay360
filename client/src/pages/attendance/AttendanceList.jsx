import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  List,
  Users,
} from 'lucide-react';

import { listAttendance } from '../../services/attendanceService';
import { formatDate } from '../../utils/helpers';

const monthBounds = (month) => {
  const [year, value] = month.split('-').map(Number);

  return {
    from: `${month}-01`,
    to: new Date(year, value, 0)
      .toISOString()
      .slice(0, 10),
  };
};

const hours = (value) =>
  `${Number(value || 0).toFixed(2)}h`;

const status = (record) =>
  record?.overtimeHours > 0
    ? 'bg-amber-100 text-amber-800'
    : record?.workedHours > 0
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-slate-100 text-slate-500';

export default function AttendanceList() {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [records, setRecords] = useState([]);
  const [view, setView] = useState('list');
  const [error, setError] = useState('');

  useEffect(() => {
    const range = monthBounds(month);

    listAttendance(range)
      .then((response) => {
        setRecords(response.data.attendance || []);
      })
      .catch((error) => {
        setError(
          error.response?.data?.message ||
            'Could not load attendance'
        );
      });
  }, [month]);

  const summary = useMemo(
    () => ({
      days: records.filter(
        (record) => record.workedHours > 0
      ).length,

      hours: records.reduce(
        (sum, record) =>
          sum + Number(record.workedHours || 0),
        0
      ),

      overtime: records.reduce(
        (sum, record) =>
          sum + Number(record.overtimeHours || 0),
        0
      ),

      sessions: records.reduce(
        (sum, record) =>
          sum + (record.sessions?.length || 0),
        0
      ),
    }),
    [records]
  );

  const calendar = useMemo(() => {
    const [year, value] = month
      .split('-')
      .map(Number);

    const days = new Date(year, value, 0).getDate();

    const first = new Date(
      year,
      value - 1,
      1
    ).getDay();

    return Array.from(
      { length: first + days },
      (_, index) =>
        index < first
          ? null
          : new Date(
              year,
              value - 1,
              index - first + 1
            )
    );
  }, [month]);

  const byDate = useMemo(
    () =>
      records.reduce((map, record) => {
        const key = new Date(record.date)
          .toISOString()
          .slice(0, 10);

        map[key] = (map[key] || []).concat(record);

        return map;
      }, {}),
    [records]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Daily work sessions, hours, overtime, and
            compensation selections.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <button
            onClick={() => setView('list')}
            className={`rounded-lg p-2 ${
              view === 'list'
                ? 'bg-primary-600 text-white'
                : 'border text-slate-600'
            }`}
            title="List view"
          >
            <List className="h-5 w-5" />
          </button>

          <button
            onClick={() => setView('calendar')}
            className={`rounded-lg p-2 ${
              view === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'border text-slate-600'
            }`}
            title="Calendar view"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          [Users, summary.days, 'Attendance days'],
          [
            Clock3,
            hours(summary.hours),
            'Total worked hours',
          ],
          [
            Clock3,
            hours(summary.overtime),
            'Overtime hours',
          ],
          [
            CalendarDays,
            summary.sessions,
            'Work sessions',
          ],
        ].map(([Icon, value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Icon className="h-5 w-5 text-primary-600" />

            <p className="mt-3 text-2xl font-bold">
              {value}
            </p>

            <p className="text-sm text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </section>

      {view === 'list' ? (
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">
                  Employee
                </th>

                <th className="px-6 py-3">
                  Date
                </th>

                <th className="px-6 py-3">
                  Sessions
                </th>

                <th className="px-6 py-3">
                  Worked
                </th>

                <th className="px-6 py-3">
                  Overtime
                </th>

                <th className="px-6 py-3">
                  Benefit
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr
                  key={record._id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <b>{record.userId?.name}</b>

                    <p className="text-xs text-slate-500">
                      {record.userId?.employeeCode}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {formatDate(record.date)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {record.sessions?.length || 0}
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    {hours(record.workedHours)}
                  </td>

                  <td className="px-6 py-4 font-semibold text-amber-700">
                    {hours(record.overtimeHours)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {record.overtimeChoice ||
                      'Awaiting choice'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!records.length && (
            <p className="p-12 text-center text-sm text-slate-500">
              No attendance records in this month.
            </p>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
            {[
              'Sun',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Sat',
            ].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendar.map((date, index) => {
              if (!date) {
                return <div key={index} />;
              }

              const key = date
                .toISOString()
                .slice(0, 10);

              const rows = byDate[key] || [];

              const total = rows.reduce(
                (sum, record) =>
                  sum +
                  Number(record.workedHours || 0),
                0
              );

              const overtime = rows.reduce(
                (sum, record) =>
                  sum +
                  Number(record.overtimeHours || 0),
                0
              );

              return (
                <div
                  key={date}
                  className="min-h-24 rounded-xl border border-slate-100 p-2"
                >
                  <p className="font-semibold text-slate-700">
                    {date.getDate()}
                  </p>

                  {rows.length ? (
                    <>
                      <span
                        className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${status(
                          {
                            workedHours: total,
                            overtimeHours: overtime,
                          }
                        )}`}
                      >
                        {hours(total)}
                      </span>

                      {overtime > 0 && (
                        <p className="mt-1 text-[10px] font-medium text-amber-700">
                          +{hours(overtime)} OT
                        </p>
                      )}

                      <p className="mt-1 text-[10px] text-slate-400">
                        {rows.length} employee(s)
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-[10px] text-slate-300">
                      No records
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}