import { useState } from "react";
import Dashboard from "./Dashboard";

function Register({ onBackToLogin }) {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            shopName,
            phone,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setIsRegistered(true);
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  if (isRegistered) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-emerald-600">
          Digital Khata
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Create your account
        </p>

        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-5"
        >

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Shop Name
            </label>

            <input
              type="text"
              placeholder="Enter shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Phone */}
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
              minLength={6}
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            Create Account
          </button>

          {/* Error / Success Message */}
          {message && (
            <p className="text-center text-sm text-red-600">
              {message}
            </p>
          )}

        </form>

        {/* Back to Login */}
        <button
          onClick={onBackToLogin}
          className="w-full mt-5 text-emerald-600 font-semibold hover:underline"
        >
          ← Back to Login
        </button>

      </div>
    </div>
  );
}

export default Register;