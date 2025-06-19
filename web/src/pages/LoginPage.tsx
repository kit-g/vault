import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService, type Login } from "../api";
import { useAuth } from "../features/AuthContext";
import { ThemeSwitchButton } from "../components/ThemeSwitch.tsx";
import { Seo } from "../components/Seo.tsx";

export default function LoginPage() {
  const [form, setForm] = useState<Login>({
    email: import.meta.env.DEV ? import.meta.env.VITE_EMAIL ?? "" : "",
    password: import.meta.env.DEV ? import.meta.env.VITE_PASSWORD ?? "" : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await AuthService.login(form);
      if (!res.session) {
        setError("Login failed. Please try again.");
        return;
      }

      if (res.session?.token) {
        login(res.session?.token);
        navigate("/");
      }

    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo/>
      <div className="relative min-h-screen flex items-center justify-center">

        <div className="absolute top-0 right-0 p-4">
          <ThemeSwitchButton/>
        </div>

        <form
          onSubmit={ handleSubmit }
          className="w-full max-w-[512px] px-6 py-10 flex flex-col"
        >
          <h2 className="text-[28px] font-bold text-center mb-6">
            Welcome back
          </h2>

          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="input-field"
              value={ form.email }
              onChange={ handleChange }
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input-field"
              value={ form.password }
              onChange={ handleChange }
            />

            <p className="text-[#96c5a8] text-sm underline cursor-pointer">
              Forgot password?
            </p>

            { error && <div className="text-red-400">{ error }</div> }

            <button type="submit" disabled={ loading } className="btn">
              { loading ? "Signing in..." : "Sign In" }
            </button>

            <Link
              to="/register"
              className="block text-[#96c5a8] text-sm text-center underline mt-4"
            >
              Don&apos;t have an account? Create one
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
