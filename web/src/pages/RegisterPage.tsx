import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/AuthContext";
import FirebaseSignInButton from "../components/FirebaseSignInButton.tsx";
import Or from "../components/Or.tsx";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import auth from "../features/Firebase.ts";
import { AuthService } from "../api";


type UserIn = {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<UserIn & { passwordConfirm: string }>(
    {
      username: "",
      email: "",
      password: "",
      passwordConfirm: ""
    }
  );

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

    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { email, password, username } = form;

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      const { session, user: registered } = await AuthService.firebaseSignin({
        requestBody: {
          idToken: await user.getIdToken(),
          username: username,
        }
      });

      if (session?.token) {
        login(session.token, registered);
      } else {
        setError("Login failed. Please try again.");
        return;
      }
      navigate("/");
    } catch (e) {
      console.log(e);
      setError("Account creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={ handleSubmit }
        className="w-full max-w-[512px] px-6 py-10 flex flex-col"
      >
        <h2 className="text-[28px] font-bold text-center mb-6">
          Create your account
        </h2>

        <div className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            className="input-field"
            value={ form.username }
            onChange={ handleChange }
          />

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

          <input
            name="passwordConfirm"
            type="password"
            placeholder="Confirm Password"
            className="input-field"
            value={ form.passwordConfirm }
            onChange={ handleChange }
          />

          { error && <div className="text-red-400">{ error }</div> }

          <button
            type="submit"
            disabled={ loading }
            className="btn"
          >
            { loading ? "Creating..." : "Create Account" }
          </button>
          <Or/>

          <FirebaseSignInButton/>

          <p
            className="text-[#9bbfa9] text-sm text-center underline mt-4 cursor-pointer"
            onClick={ () => navigate("/login") }
          >
            Already have an account? Sign in
          </p>
        </div>
      </form>
    </div>
  );
}
