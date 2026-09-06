import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Wallet } from 'lucide-react';

import { listContracts } from '../../services/contractService';

const inr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function ContractList() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listContracts()
      .then((response) => {
        setItems(response.data.contracts || []);
      })
      .catch((error) => {
        setError(
          error.response?.data?.message ||
            'Could not load contracts'
        );
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Contracts
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Active employment terms, working hours, and monthly
          salary breakdowns.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">
                  Employee
                </th>

                <th className="px-6 py-3">
                  Contract
                </th>

                <th className="px-6 py-3">
                  Working hours
                </th>

                <th className="px-6 py-3">
                  Monthly gross
                </th>

                <th className="px-6 py-3">
                  Status
                </th>

                <th className="px-6 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((contract) => (
                <tr
                  key={contract._id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {contract.userId?.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {contract.userId?.employeeCode} ·{' '}
                      {contract.position ||
                        contract.userId?.position}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {contract.contractNumber}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {contract.userId?.scheduleId?.weeklyHours ||
                      '—'}{' '}
                    hrs/week
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <Wallet className="h-4 w-4 text-primary-600" />
                      {inr(contract.pay?.gross)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        contract.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {contract.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                      to={`/contracts/${contract._id}`}
                    >
                      <FileText className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!items.length && (
          <p className="p-12 text-center text-sm text-slate-500">
            No contracts found.
          </p>
        )}
      </div>
    </div>
  );
}