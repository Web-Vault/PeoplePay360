import { useEffect, useState } from 'react';
import {
  Clock3,
  LogIn,
  LogOut,
  Wallet,
} from 'lucide-react';

import Button from '../../components/common/Button';
import LiveWorkTimer from '../../components/attendance/LiveWorkTimer';

import {
  checkIn,
  checkOut,
  chooseOvertime,
  getToday,
} from '../../services/attendanceService';

// Format money as Indian Rupees
const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

// Format date/time
const time = (value) =>
  value
    ? new Date(value).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'In progress';

export default function MyAttendanceLive() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(false);
  const [message, setMessage] = useState('');

  // Load today's attendance
  const load = () => {
    setLoading(true);

    getToday()
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.message ||
            'Could not load today’s attendance'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  // Find currently active work session
  const openSession = data?.sessions?.find(
    (session) => !session.endedAt
  );

  // Run attendance action
  const run = async (fn) => {
    setAction(true);
    setMessage('');

    try {
      await fn();
      await load();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Could not update attendance'
      );
    } finally {
      setAction(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Loading attendance…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My attendance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your timer, work sessions, daily earnings, and overtime.
        </p>
      </div>

      {/* Message */}
      {message && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          {message}
        </p>
      )}

      {/* Live Timer */}
      <LiveWorkTimer
        startedAt={openSession?.startedAt}
        todayHours={data?.workedHours}
      />

      {/* Attendance Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Worked Hours */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Clock3 className="h-5 w-5 text-primary-600" />

          <p className="mt-3 text-2xl font-bold">
            {data?.workedHours || 0}h
          </p>

          <p className="text-sm text-slate-500">
            Completed today / {data?.requiredHours || 8}h required
          </p>
        </div>

        {/* Overtime */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Clock3 className="h-5 w-5 text-amber-600" />

          <p className="mt-3 text-2xl font-bold">
            {data?.overtimeHours || 0}h
          </p>

          <p className="text-sm text-slate-500">
            Overtime today
          </p>
        </div>

        {/* Daily Earnings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Wallet className="h-5 w-5 text-emerald-600" />

          <p className="mt-3 text-2xl font-bold">
            {money(data?.dailyWage)}
          </p>

          <p className="text-sm text-slate-500">
            Earned today
          </p>
        </div>
      </div>

      {/* Work Sessions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">
              Today’s work sessions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Check out for a break; check in when you resume.
            </p>
          </div>

          <Button
            loading={action}
            onClick={() =>
              run(openSession ? checkOut : checkIn)
            }
          >
            {openSession ? (
              <>
                <LogOut className="h-4 w-4" />
                Check out
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Check in
              </>
            )}
          </Button>
        </div>

        {/* Sessions List */}
        <div className="mt-5 divide-y divide-slate-100">
          {data?.sessions?.length ? (
            data.sessions.map((session) => {
              const duration = session.endedAt
                ? (
                    (new Date(session.endedAt) -
                      new Date(session.startedAt)) /
                    3600000
                  ).toFixed(2)
                : null;

              return (
                <div
                  key={session._id}
                  className="flex justify-between py-3 text-sm"
                >
                  <span className="font-medium">
                    {time(session.startedAt)} –{' '}
                    {time(session.endedAt)}
                  </span>

                  <span className="text-slate-500">
                    {duration
                      ? `${duration} hours`
                      : 'Timer running'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No work session today.
            </p>
          )}
        </div>
      </section>

      {/* Overtime Benefit */}
      {data?.overtimeHours > 0 && (
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold">
            Choose your overtime benefit
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Choose cash or compensatory leave for{' '}
            {data.overtimeHours} overtime hours.
          </p>

          <div className="mt-4 flex gap-3">
            <Button
              variant="secondary"
              loading={action}
              onClick={() =>
                run(() =>
                  chooseOvertime(
                    data.date,
                    'comp_time'
                  )
                )
              }
            >
              Convert to comp time
            </Button>

            <Button
              loading={action}
              onClick={() =>
                run(() =>
                  chooseOvertime(
                    data.date,
                    'cash'
                  )
                )
              }
            >
              Add {money(data.overtimePay)} to payroll
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}