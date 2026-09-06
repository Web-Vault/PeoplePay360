import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react';

import { getEmployee } from '../../services/employeeService';
import { formatDate } from '../../utils/helpers';

const Item = ({ label, value, icon: Icon }) => (
  <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
    <Icon className="mt-0.5 h-5 w-5 text-primary-600" />

    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || 'Not provided'}
      </p>
    </div>
  </div>
);

export default function EmployeeDetail() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmployee(id)
      .then((response) => {
        setEmployee(response.data.employee);
      })
      .catch((error) => {
        setError(
          error.response?.data?.message || 'Employee not found'
        );
      });
  }, [id]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  if (!employee) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Loading employee profile…
      </p>
    );
  }

  const address = [
    employee.address?.street,
    employee.address?.city,
    employee.address?.state,
    employee.address?.country,
    employee.address?.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/employees"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Employees
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-xl font-bold text-white">
              {employee.firstName?.[0]}
              {employee.lastName?.[0]}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {employee.firstName} {employee.lastName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {employee.position || 'Employee'} · {employee.employeeCode}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/employees/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Employee Information */}
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
        <Item
          label="Email"
          value={employee.email}
          icon={Mail}
        />

        <Item
          label="Phone"
          value={employee.phone}
          icon={Phone}
        />

        <Item
          label="Department"
          value={employee.departmentId?.name}
          icon={BriefcaseBusiness}
        />

        <Item
          label="Manager"
          value={
            employee.managerId
              ? `${employee.managerId.firstName} ${employee.managerId.lastName}`
              : 'No manager assigned'
          }
          icon={UserRound}
        />

        <Item
          label="Joining date"
          value={
            employee.joiningDate
              ? formatDate(employee.joiningDate)
              : ''
          }
          icon={CalendarDays}
        />

        <Item
          label="Work schedule"
          value={employee.scheduleId?.name}
          icon={BriefcaseBusiness}
        />

        <div className="sm:col-span-2">
          <Item
            label="Address"
            value={address}
            icon={MapPin}
          />
        </div>
      </section>

      {/* Bank Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <Banknote className="h-5 w-5 text-primary-600" />
          Bank details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Item
            label="Account holder"
            value={employee.bankDetails?.accountHolderName}
            icon={UserRound}
          />

          <Item
            label="Bank"
            value={employee.bankDetails?.bankName}
            icon={Banknote}
          />

          <Item
            label="Account number"
            value={employee.bankDetails?.accountNumber}
            icon={Banknote}
          />

          <Item
            label="IFSC"
            value={employee.bankDetails?.ifsc}
            icon={Banknote}
          />
        </div>
      </section>

      {/* Metadata */}
      <p className="text-right text-xs text-slate-400">
        Profile created{' '}
        {employee.createdAt
          ? formatDate(employee.createdAt)
          : '—'}{' '}
        · Last updated{' '}
        {employee.updatedAt
          ? formatDate(employee.updatedAt)
          : '—'}
      </p>
    </div>
  );
}