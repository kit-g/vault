import * as React from "react";
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AuthService, type Login} from "../api";
import {useAuth} from "../features/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState<Login>({email: "", password: ""});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
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
    <div
      className="min-h-screen bg-[#122118] flex items-center justify-center text-white"
      style={{fontFamily: "Inter, Noto Sans, sans-serif"}}
    >
      <form
        onSubmit={handleSubmit}
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
            className="w-full rounded-lg bg-[#264532] text-white placeholder:text-[#96c5a8] h-14 p-4 text-base focus:outline-none"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-lg bg-[#264532] text-white placeholder:text-[#96c5a8] h-14 p-4 text-base focus:outline-none"
            value={form.password}
            onChange={handleChange}
          />

          <p className="text-[#96c5a8] text-sm underline cursor-pointer">
            Forgot password?
          </p>

          {error && <div className="text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-[#38e078] text-[#122118] font-bold tracking-wide"
          >
            {loading ? "Signing in..." : "Sign In"}
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
  );
}
