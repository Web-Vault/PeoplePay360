
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Wallet,
} from 'lucide-react';

import { getEmployeePayroll } from '../../services/payrollService';
import { formatDate } from '../../utils/helpers';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const Line = ({ label, value, red, green }) => (
  <div className="flex justify-between py-2 text-sm">
    <span className="text-slate-500">{label}</span>

    <b
      className={
        red
          ? 'text-red-600'
          : green
            ? 'text-emerald-700'
            : 'text-slate-800'
      }
    >
      {money(value)}
    </b>
  </div>
);

export default function EmployeePayrollDetail() {
  const { userId } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmployeePayroll(userId)
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            'Could not load employee payroll'
        );
      });
  }, [userId]);

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-red-700">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Loading employee payroll…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/payroll"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Payroll
        </Link>

        <h1 className="mt-3 text-2xl font-bold">
          {data.employee?.name}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {data.employee?.employeeCode} · Current month detail
        </p>
      </div>

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <Clock3 className="h-5 w-5 text-primary-600" />

          <b className="mt-3 block text-xl">
            {data.workedHours} hrs
          </b>

          <small className="text-slate-500">
            {data.workedDays} worked days
          </small>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <Clock3 className="h-5 w-5 text-amber-600" />

          <b className="mt-3 block text-xl">
            {data.overtimeHours} hrs
          </b>

          <small className="text-slate-500">
            Overtime this month
          </small>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <CalendarDays className="h-5 w-5 text-red-600" />

          <b className="mt-3 block text-xl">
            {data.unpaidLeave.days} days
          </b>

          <small className="text-slate-500">
            Unpaid leave
          </small>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <Wallet className="h-5 w-5 text-emerald-600" />

          <b className="mt-3 block text-xl text-emerald-800">
            {money(data.earnedSoFar)}
          </b>

          <small className="text-emerald-700">
            Earned so far
          </small>
        </div>
      </section>

      {/* Salary Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regular Contract Salary */}
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold">
            Regular contract salary
          </h2>

          <div className="mt-4 divide-y">
            <Line
              label="Basic salary"
              value={data.contract.basicSalary}
            />

            {data.contract.allowances.map((item, index) => (
              <Line
                key={index}
                label={item.name}
                value={item.amount}
                green
              />
            ))}

            <Line
              label="Gross salary"
              value={data.contract.gross}
            />

            {data.contract.deductions.map((item, index) => (
              <Line
                key={index}
                label={item.name}
                value={item.amount}
                red
              />
            ))}

            <Line
              label="Regular net salary"
              value={data.contract.net}
              green
            />
          </div>
        </section>

        {/* Monthly Payroll Changes */}
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold">
            This month’s payroll changes
          </h2>

          <div className="mt-4 divide-y">
            <Line
              label="Attendance-earned net"
              value={data.earnedNet}
            />

            <Line
              label={`Cash overtime (${data.overtime.cashHours} hrs)`}
              value={data.overtime.cashAmount}
              green
            />

            {data.adjustments?.map((item, index) => (
              <Line
                key={index}
                label={`${item.name} · ${item.effectiveMonth}`}
                value={item.amount}
                green={item.type === 'addition'}
                red={item.type === 'deduction'}
              />
            ))}

            <Line
              label={`Unpaid leave deduction (${data.unpaidLeave.days} days)`}
              value={data.unpaidLeave.deduction}
              red
            />

            <div className="flex justify-between border-t pt-4 text-base">
              <b>Earned so far</b>

              <b className="text-emerald-700">
                {money(data.earnedSoFar)}
              </b>
            </div>

            <div className="flex justify-between pt-3 text-base">
              <b>Projected month-end pay</b>

              <b className="text-primary-700">
                {money(data.projectedMonthPay)}
              </b>
            </div>
          </div>
        </section>
      </div>

      {/* Payslip History */}
      <section className="rounded-2xl border bg-white">
        <div className="border-b p-5 font-semibold">
          Last 3 months payslip history
        </div>

        {data.history.map((slip) => (
          <div
            key={slip._id}
            className="grid gap-3 border-b p-5 text-sm sm:grid-cols-5"
          >
            <div>
              <b>
                {formatDate(slip.periodStart)} –{' '}
                {formatDate(slip.periodEnd)}
              </b>

              <p className="text-xs text-slate-500">
                {slip.payslipNumber}
              </p>
            </div>

            <div>
              Gross
              <br />
              <b>{money(slip.grossSalary)}</b>
            </div>

            <div>
              Deductions
              <br />
              <b className="text-red-600">
                {money(slip.totalDeductions)}
              </b>
            </div>

            <div>
              Overtime
              <br />
              <b>{slip.overtimeHours || 0} hrs</b>
            </div>

            <div>
              Net pay
              <br />
              <b className="text-emerald-700">
                {money(slip.netSalary)}
              </b>
            </div>
          </div>
        ))}

        {!data.history.length && (
          <p className="p-10 text-center text-sm text-slate-500">
            No previous payslips available.
          </p>
        )}
      </section>
    </div>
  );
}
