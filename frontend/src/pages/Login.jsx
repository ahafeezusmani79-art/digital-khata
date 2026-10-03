
import { useState } from "react";
import Register from "./Register";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phone,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Tell App.jsx that login was successful
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong");
    }
  };

  if (showRegister) {
    return (
      <Register
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-emerald-600">
          Digital Khata
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Login to your account
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>

            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            Login
          </button>

          {message && (
            <p className="text-center text-sm text-red-600">
              {message}
            </p>
          )}

        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?
          </p>

          <button
            onClick={() => {
              setMessage("");
              setShowRegister(true);
            }}
            className="mt-2 text-emerald-600 font-semibold hover:underline"
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;