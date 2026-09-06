import { useEffect, useState } from 'react';
import { CalendarDays, XCircle } from 'lucide-react';

import Button from '../../components/common/Button';
import {
  cancelMyTimeOff,
  getMyTimeOff,
  requestTimeOff,
} from '../../services/selfService';
import { formatDate } from '../../utils/helpers';

export default function MyTimeOff() {
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    timeOffTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Load time-off data
  const load = () => {
    getMyTimeOff()
      .then((response) => {
        setData(response.data);

        setForm((old) => ({
          ...old,
          timeOffTypeId:
            old.timeOffTypeId || response.data.types?.[0]?._id || '',
        }));
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            'Could not load leave information'
        );
      });
  };

  useEffect(() => {
    load();
  }, []);

  // Submit time-off request
  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await requestTimeOff(form);

      setForm((old) => ({
        ...old,
        startDate: '',
        endDate: '',
        reason: '',
      }));

      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not submit request'
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel time-off request
  const cancel = async (id) => {
    try {
      await cancelMyTimeOff(id);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not cancel request'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">My time off</h1>

        <p className="mt-1 text-sm text-slate-500">
          Your leave balances, requests, and compensatory time.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Leave Balances */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.allocations?.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <CalendarDays className="h-5 w-5 text-primary-600" />

            <p className="mt-3 font-semibold">
              {item.timeOffTypeId?.name}
            </p>

            <p className="mt-1 text-2xl font-bold">
              {item.remainingDays}
            </p>

            <p className="text-sm text-slate-500">
              of {item.allocatedDays} days remaining
            </p>
          </div>
        ))}
      </section>

      {/* Request Time Off */}
      <form
        onSubmit={submit}
        className="rounded-2xl border bg-white p-5 shadow-sm"
      >
        <h2 className="font-semibold">Request time off</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {/* Time Off Type */}
          <select
            required
            value={form.timeOffTypeId}
            onChange={(event) =>
              setForm({
                ...form,
                timeOffTypeId: event.target.value,
              })
            }
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            {data.types?.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
                {type.isPaid ? ' · Paid' : ' · Unpaid'}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <input
            required
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm({
                ...form,
                startDate: event.target.value,
              })
            }
            className="rounded-lg border px-3 py-2"
          />

          {/* End Date */}
          <input
            required
            type="date"
            min={form.startDate}
            value={form.endDate}
            onChange={(event) =>
              setForm({
                ...form,
                endDate: event.target.value,
              })
            }
            className="rounded-lg border px-3 py-2"
          />

          {/* Submit Button */}
          <Button type="submit" loading={saving}>
            Submit request
          </Button>
        </div>

        {/* Reason */}
        <textarea
          value={form.reason}
          onChange={(event) =>
            setForm({
              ...form,
              reason: event.target.value,
            })
          }
          placeholder="Reason (optional)"
          className="mt-3 min-h-20 w-full rounded-lg border px-3 py-2 text-sm"
        />
      </form>

      {/* Leave Requests */}
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5 font-semibold">
          Leave requests
        </div>

        <div className="divide-y">
          {data.requests?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-4 p-5 text-sm"
            >
              {/* Request Details */}
              <div>
                <b>{item.timeOffTypeId?.name}</b>

                <p className="mt-1 text-slate-500">
                  {formatDate(item.startDate)} –{' '}
                  {formatDate(item.endDate)} · {item.days} day(s)
                </p>

                {item.rejectionReason && (
                  <p className="mt-1 text-red-600">
                    Reason: {item.rejectionReason}
                  </p>
                )}
              </div>

              {/* Status + Cancel */}
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">
                  {item.status}
                </span>

                {item.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => cancel(item._id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Cancel request"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!data.requests?.length && (
            <p className="p-10 text-center text-sm text-slate-500">
              No leave requests yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}