import { useEffect, useState } from 'react';
import {
  BadgeIndianRupee,
  FileText,
  Info,
  Wallet,
} from 'lucide-react';

import {
  getMyContract,
  getMyPayslips,
} from '../../services/selfService';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : '';

function Line({
  label,
  value,
  tone = 'text-slate-900',
}) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm">
      <span className="text-slate-600">
        {label}
      </span>

      <b className={tone}>
        {money(value)}
      </b>
    </div>
  );
}

export default function ExplainMySalary() {
  const [contractData, setContractData] = useState(null);
  const [payslip, setPayslip] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load contract and latest payslip
  useEffect(() => {
    Promise.all([
      getMyContract(),
      getMyPayslips(),
    ])
      .then(([contractResponse, slipsResponse]) => {
        setContractData(contractResponse.data);

        setPayslip(
          (slipsResponse.data?.payslips || [])[0] || null
        );
      })
      .catch((error) => {
        setError(
          error.response?.data?.message ||
            'Could not load your salary information'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Loading state
  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Loading your salary information…
      </p>
    );
  }

  // Error state
  if (error) {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  const contract = contractData?.contract;
  const pay = contract?.pay;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Explain my salary
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          A clear breakdown of your contract salary and latest
          issued payslip.
        </p>
      </div>

      {/* Contract Expiry Warning */}
      {contractData?.expired && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <b>Contract status needs attention.</b>{' '}
          The figures below may not apply to a future payroll
          cycle until HR renews your contract.
        </div>
      )}

      {/* Salary Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        {/* Monthly Gross */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Wallet className="h-5 w-5 text-primary-600" />

          <p className="mt-3 text-sm text-slate-500">
            Monthly gross
          </p>

          <p className="text-xl font-bold">
            {money(pay?.gross)}
          </p>
        </div>

        {/* Monthly Deductions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <BadgeIndianRupee className="h-5 w-5 text-red-600" />

          <p className="mt-3 text-sm text-slate-500">
            Monthly deductions
          </p>

          <p className="text-xl font-bold text-red-600">
            {money(pay?.totalDeductions)}
          </p>
        </div>

        {/* Expected Net */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <Wallet className="h-5 w-5 text-emerald-600" />

          <p className="mt-3 text-sm text-emerald-700">
            Expected monthly net
          </p>

          <p className="text-xl font-bold text-emerald-800">
            {money(pay?.net)}
          </p>
        </div>
      </section>

      {/* Contract Salary Breakdown */}
      {contract ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Salary Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">
              How your contract pay is built
            </h2>

            <div className="mt-3 divide-y">
              <Line
                label="Basic salary"
                value={contract.basicSalary}
              />

              {pay?.allowances?.map((item, index) => (
                <Line
                  key={index}
                  label={item.name}
                  value={item.amount}
                  tone="text-emerald-700"
                />
              ))}

              <Line
                label="Gross salary"
                value={pay?.gross}
              />

              {pay?.deductions?.map((item, index) => (
                <Line
                  key={index}
                  label={item.name}
                  value={item.amount}
                  tone="text-red-600"
                />
              ))}

              <div className="flex justify-between border-t pt-4 text-base">
                <b>Expected net salary</b>

                <b className="text-emerald-700">
                  {money(pay?.net)}
                </b>
              </div>
            </div>
          </div>

          {/* Take-Home Explanation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">
              What changes your take-home pay?
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <b className="text-slate-900">
                  Attendance:
                </b>{' '}
                pay is earned as work is recorded during the
                month.
              </p>

              <p>
                <b className="text-slate-900">
                  Overtime:
                </b>{' '}
                approved cash overtime is added using your
                contract overtime rate of{' '}
                {money(contract.overtimeRate)} per hour.
              </p>

              <p>
                <b className="text-slate-900">
                  Time off:
                </b>{' '}
                approved unpaid leave can reduce the month’s
                final pay.
              </p>

              <p>
                <b className="text-slate-900">
                  Payslip:
                </b>{' '}
                the final approved figures appear once Payroll
                issues the monthly payslip.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* No Contract */
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Info className="mx-auto h-7 w-7 text-slate-400" />

          <h2 className="mt-3 font-semibold">
            No current contract found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ask HR to assign or renew your contract to show
            your salary breakdown.
          </p>
        </section>
      )}

      {/* Latest Payslip */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />

          <h2 className="font-semibold">
            Latest issued payslip
          </h2>
        </div>

        {payslip ? (
          <div className="mt-4 divide-y">
            <p className="pb-3 text-sm text-slate-500">
              {date(payslip.periodStart)} ·{' '}
              {payslip.payslipNumber}
            </p>

            <Line
              label="Gross earnings"
              value={payslip.grossSalary}
            />

            <Line
              label="Deductions"
              value={payslip.totalDeductions}
              tone="text-red-600"
            />

            <Line
              label={`Overtime (${payslip.overtimeHours || 0} hrs)`}
              value={0}
            />

            <div className="flex justify-between border-t pt-4 text-base">
              <b>Net pay issued</b>

              <b className="text-emerald-700">
                {money(payslip.netSalary)}
              </b>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No payslip has been issued yet. Your contract
            breakdown is shown above.
          </p>
        )}
      </section>
    </div>
  );
}