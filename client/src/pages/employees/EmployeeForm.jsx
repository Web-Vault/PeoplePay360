import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Mail,
  Phone,
  Save,
  UserRound,
} from 'lucide-react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
  createEmployee,
  getEmployee,
  updateEmployee,
} from '../../services/employeeService';

const blank = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  profileImage: '',
  position: '',
  joiningDate: '',
  status: 'active',
  address: {
    street: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
  },
  bankDetails: {
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifsc: '',
  },
};

const toForm = (employee) => ({
  ...blank,
  ...employee,
  status: employee.employmentStatus || 'active',
  joiningDate: employee.joiningDate?.slice(0, 10) || '',
  address: {
    ...blank.address,
    ...(employee.address || {}),
  },
  bankDetails: {
    ...blank.bankDetails,
    ...(employee.bankDetails || {}),
  },
});

export default function EmployeeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    getEmployee(id)
      .then((response) => {
        setForm(toForm(response.data.employee));
      })
      .catch(() => {
        setErrors({
          server: 'Employee could not be loaded.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, editing]);

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const address = (key, value) => {
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };

  const bank = (key, value) => {
    setForm((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [key]: value,
      },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const required = [
      'employeeCode',
      'firstName',
      'lastName',
      'email',
    ];

    const next = {};

    required.forEach((field) => {
      if (!form[field]?.trim()) {
        next[field] = 'This field is required';
      }
    });

    if (
      form.email &&
      !/^\S+@\S+\.\S+$/.test(form.email)
    ) {
      next.email = 'Enter a valid email';
    }

    setErrors(next);

    if (Object.keys(next).length) return;

    setSaving(true);

    try {
      const payload = {
        employeeCode: form.employeeCode.trim().toUpperCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone || undefined,
        profileImage: form.profileImage || undefined,
        position: form.position || undefined,
        joiningDate: form.joiningDate || undefined,
        status: form.status,
        address: form.address,
        bankDetails: form.bankDetails,
      };

      const result = editing
        ? await updateEmployee(id, payload)
        : await createEmployee(payload);

      navigate(`/employees/${result.data.employee._id}`, {
        replace: true,
      });
    } catch (err) {
      const fields = {};

      err.response?.data?.errors?.forEach((error) => {
        fields[error.path] = error.msg;
      });

      setErrors(
        Object.keys(fields).length
          ? fields
          : {
              server:
                err.response?.data?.message ||
                'Unable to save employee.',
            }
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Loading employee…
      </p>
    );
  }

  const text = (
    label,
    key,
    Icon,
    required = false,
    type = 'text'
  ) => (
    <Input
      label={label}
      name={key}
      type={type}
      icon={Icon}
      required={required}
      value={form[key] || ''}
      errors={errors[key]}
      onChange={(e) => change(key, e.target.value)}
    />
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to={editing ? `/employees/${id}` : '/employees'}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to employees
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          {editing ? 'Edit employee' : 'Add employee'}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Fields marked with an asterisk are required.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Server Error */}
        {errors.server && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errors.server}
          </div>
        )}

        {/* Personal Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <UserRound className="h-5 w-5 text-primary-600" />
            Personal information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {text(
              'Employee ID',
              'employeeCode',
              BriefcaseBusiness,
              true
            )}

            {text(
              'Email address',
              'email',
              Mail,
              true,
              'email'
            )}

            {text(
              'First name',
              'firstName',
              UserRound,
              true
            )}

            {text(
              'Last name',
              'lastName',
              UserRound,
              true
            )}

            {text(
              'Phone number',
              'phone',
              Phone
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Employment status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  change('status', e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">
                  Terminated
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <BriefcaseBusiness className="h-5 w-5 text-primary-600" />
            Employment details
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {text(
              'Job title',
              'position',
              BriefcaseBusiness
            )}

            {text(
              'Joining date',
              'joiningDate',
              undefined,
              false,
              'date'
            )}
          </div>
        </section>

        {/* Address */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-slate-900">
            Address
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Street address"
              value={form.address.street}
              onChange={(e) =>
                address('street', e.target.value)
              }
            />

            <Input
              label="City"
              value={form.address.city}
              onChange={(e) =>
                address('city', e.target.value)
              }
            />

            <Input
              label="State"
              value={form.address.state}
              onChange={(e) =>
                address('state', e.target.value)
              }
            />

            <Input
              label="Country"
              value={form.address.country}
              onChange={(e) =>
                address('country', e.target.value)
              }
            />

            <Input
              label="Postal code"
              value={form.address.postalCode}
              onChange={(e) =>
                address('postalCode', e.target.value)
              }
            />
          </div>
        </section>

        {/* Bank Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-slate-900">
            Bank details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Stored securely with the employee profile.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Account holder name"
              value={form.bankDetails.accountHolderName}
              onChange={(e) =>
                bank(
                  'accountHolderName',
                  e.target.value
                )
              }
            />

            <Input
              label="Bank name"
              value={form.bankDetails.bankName}
              onChange={(e) =>
                bank('bankName', e.target.value)
              }
            />

            <Input
              label="Account number"
              value={form.bankDetails.accountNumber}
              onChange={(e) =>
                bank(
                  'accountNumber',
                  e.target.value
                )
              }
            />

            <Input
              label="IFSC code"
              value={form.bankDetails.ifsc}
              onChange={(e) =>
                bank('ifsc', e.target.value)
              }
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(
                editing ? `/employees/${id}` : '/employees'
              )
            }
          >
            Cancel
          </Button>

          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            {editing ? 'Save changes' : 'Create employee'}
          </Button>
        </div>
      </form>
    </div>
  );
}