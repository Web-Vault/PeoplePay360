import { useEffect, useState } from 'react';

import { Check, X } from 'lucide-react';

import Button from '../../components/common/Button';

import {
  approveTimeOff,
  listTimeOff,
  rejectTimeOff,
} from '../../services/selfService';

import { formatDate } from '../../utils/helpers';

export default function TimeOffManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await listTimeOff();

      setItems(response.data?.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load leave requests'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRequest = async (id, action) => {
    setBusyId(id);
    setError('');

    try {
      if (action === 'approve') {
        await approveTimeOff(id);
      } else {
        await rejectTimeOff(id);
      }

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not update leave request'
      );
    } finally {
      setBusyId('');
    }
  };

  const pending = items.filter(
    (item) => item.status === 'pending'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Time off
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review employee leave requests and their payroll impact.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button onClick={load} className="font-semibold">
            Try again
          </button>
        </div>
      )}

      {/* Requests */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <b>
            {pending.length} pending request
            {pending.length === 1 ? '' : 's'}
          </b>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-slate-500">
            Loading leave requests…
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Leave type</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id}>
                    {/* Employee */}
                    <td className="px-5 py-4">
                      <b>
                        {item.userId?.name || 'Employee'}
                      </b>

                      <p className="text-xs text-slate-500">
                        {item.userId?.employeeCode}
                      </p>
                    </td>

                    {/* Leave Type */}
                    <td className="px-5 py-4 text-sm">
                      <b>{item.timeOffTypeId?.name}</b>

                      <p className="text-xs text-slate-500">
                        {item.timeOffTypeId?.isPaid
                          ? 'Paid leave'
                          : 'Unpaid leave'}
                      </p>
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-4 text-sm">
                      {formatDate(item.startDate)} –{' '}
                      {formatDate(item.endDate)}
                    </td>

                    {/* Days */}
                    <td className="px-5 py-4 text-sm">
                      {item.days}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {item.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            loading={busyId === item._id}
                            onClick={() =>
                              updateRequest(
                                item._id,
                                'approve'
                              )
                            }
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busyId === item._id}
                            onClick={() =>
                              updateRequest(
                                item._id,
                                'reject'
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {!items.length && (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-12 text-center text-sm text-slate-500"
                    >
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
