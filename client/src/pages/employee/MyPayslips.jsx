import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

import { getMyPayslips } from '../../services/selfService';
import { formatDate } from '../../utils/helpers';

const inr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function MyPayslips() {
  const [items, setItems] = useState([]);

  // Load payslips
  useEffect(() => {
    getMyPayslips().then((response) => {
      setItems(response.data.payslips || []);
    });
  }, []);

  return (
    <div>
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-slate-900">
        My payslips
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Your payroll, deductions, overtime, and take-home pay.
      </p>

      {/* Payslip List */}
      <div className="mt-6 space-y-4">
        {items.map((slip) => (
          <div
            key={slip._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* Payslip Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText className="h-5 w-5 text-primary-600" />
                  {slip.payslipNumber}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(slip.periodStart)} –{' '}
                  {formatDate(slip.periodEnd)}
                </p>
              </div>

              <p className="text-lg font-bold text-slate-900">
                {inr(slip.netSalary)}
              </p>
            </div>

            {/* Payslip Summary */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-sm">
              {/* Gross */}
              <div>
                <p className="text-slate-500">
                  Gross
                </p>

                <p className="font-semibold">
                  {inr(slip.grossSalary)}
                </p>
              </div>

              {/* Deductions */}
              <div>
                <p className="text-slate-500">
                  Deductions
                </p>

                <p className="font-semibold text-red-600">
                  {inr(slip.totalDeductions)}
                </p>
              </div>

              {/* Overtime */}
              <div>
                <p className="text-slate-500">
                  Overtime
                </p>

                <p className="font-semibold">
                  {slip.overtimeHours || 0} hrs
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!items.length && (
          <p className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No payslips have been issued yet.
          </p>
        )}
      </div>
    </div>
  );
}