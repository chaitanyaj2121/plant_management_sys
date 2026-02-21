import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, registerUser } from "../api/client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (values) => {
    const errors = {};

    if (!values.name.trim()) {
      errors.name = "Name is required";
    } else if (values.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(values.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(values.password)) {
      errors.password = "Use at least 6 chars with letters and numbers";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/plant", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
      <p className="mt-1 text-sm text-gray-600">Register to access the dashboard.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="text"
            value={form.name}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, name: value }));
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="email"
            value={form.email}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, email: value }));
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="password"
            value={form.password}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, password: value }));
              if (fieldErrors.password || fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  password: undefined,
                  confirmPassword: undefined,
                }));
              }
            }}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, confirmPassword: value }));
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
          />
          {fieldErrors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
