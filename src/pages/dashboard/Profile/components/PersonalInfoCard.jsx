import React, { useEffect, useState } from "react";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  username: "",
  department: "",
  designation: "",
  employeeId: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  timeZone: "",
};

export default function PersonalInfoCard({
  data,
  isEditing,
  saving,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!data) return;

    setForm({
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      username: data.username || "",
      department: data.department || "",
      designation: data.designation || "",
      employeeId: data.employeeId || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      country: data.country || "",
      postalCode: data.postalCode || "",
      timeZone: data.timeZone || "",
    });
  }, [data]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Backend ke actual column names
    const payload = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      username: form.username,
      department: form.department,
      job_title: form.designation,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      postal_code: form.postalCode,
      time_zone: form.timeZone,
    };

    onSave(payload);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/60 border border-slate-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Update Personal Information
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Update your profile information below.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <Input
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
          />

          <Input
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
          />

          <Input
            label="Employee ID"
            name="employeeId"
            value={form.employeeId}
            disabled
            onChange={handleChange}
          />

          <Input
            label="Time Zone"
            name="timeZone"
            value={form.timeZone}
            onChange={handleChange}
          />

          <Input
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="md:col-span-2"
          />

          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <Input
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />

          <Input
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
          />

          <Input
            label="Postal Code"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Personal Information
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Your personal and contact information.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Full Name" value={data.fullName} />
        <Info label="Email" value={data.email} />
        <Info label="Phone" value={data.phone} />
        <Info label="Username" value={data.username} />
        <Info label="Department" value={data.department} />
        <Info label="Designation" value={data.designation} />
        <Info label="Employee ID" value={data.employeeId} />
        <Info label="Time Zone" value={data.timeZone} />
        <Info
          label="Address"
          value={data.address}
        />
        <Info label="City" value={data.city} />
        <Info label="State" value={data.state} />
        <Info label="Country" value={data.country} />
        <Info label="Postal Code" value={data.postalCode} />
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 disabled:opacity-50"
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">
        {label}
      </p>

      <p className="text-sm text-slate-200">
        {value || "Not provided"}
      </p>
    </div>
  );
}