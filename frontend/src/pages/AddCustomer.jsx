import { useState } from "react";

function AddCustomer({ onBack, onCustomerAdded }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [creditLimit, setCreditLimit] = useState("5000");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // Name validation
    if (name.trim().length < 2) {
      setMessage("Customer name must be at least 2 characters.");
      return;
    }

    // Phone validation
    if (phone.trim().length < 10) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    // Credit limit validation
    const limit = Number(creditLimit);

    if (isNaN(limit) || limit < 0) {
      setMessage("Credit limit cannot be negative.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            creditLimit: limit,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add customer.");
        return;
      }

      setMessage("Customer added successfully!");

      setName("");
      setPhone("");
      setCreditLimit("5000");

      if (onCustomerAdded) {
        onCustomerAdded();
      }
    } catch (error) {
      console.error("Add customer error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:p-6">
      <div className="max-w-xl mx-auto">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-5 sm:mb-6 text-emerald-600 font-semibold hover:underline"
        >
          ← Back to Customers
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-8">

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Add Customer
          </h1>

          <p className="text-slate-500 mt-2">
            Add a new customer to your Khata
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 sm:mt-8 space-y-5"
          >

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Name
              </label>

              <input
                type="text"
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Phone Number */}
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

            {/* Credit Limit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Credit Limit
              </label>

              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Add Customer
            </button>

            {/* Message */}
            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("successfully")
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}

export default AddCustomer;