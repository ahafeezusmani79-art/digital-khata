import { useState } from "react";

function AddTransaction({ customer, onBack, onTransactionAdded }) {
  const [type, setType] = useState("GAVE");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const transactionAmount = Number(amount);

    // Amount validation
    if (
      !amount ||
      isNaN(transactionAmount) ||
      transactionAmount <= 0
    ) {
      setMessage("Please enter a valid amount greater than 0.");
      return;
    }

    // Credit limit validation for GAVE
    if (
      type === "GAVE" &&
      customer.currentBalance + transactionAmount >
        customer.creditLimit
    ) {
      setMessage(
        `Credit limit exceeded. Available limit: Rs. ${
          customer.creditLimit - customer.currentBalance
        }`
      );
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            customerId: customer._id,
            type,
            amount: transactionAmount,
            note: note.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to add transaction."
        );
        return;
      }

      setMessage("Transaction added successfully!");

      setAmount("");
      setNote("");

      if (onTransactionAdded) {
        onTransactionAdded(data.currentBalance);
      }
    } catch (error) {
      console.error("Add transaction error:", error);
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
          ← Back to Khata
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-8">

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Add Transaction
          </h1>

          <p className="text-slate-500 mt-2 break-words">
            {customer.name}
          </p>

          {/* Transaction Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7 sm:mt-8">

            <button
              type="button"
              onClick={() => setType("GAVE")}
              className={`py-3 rounded-lg font-semibold ${
                type === "GAVE"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              You Gave
            </button>

            <button
              type="button"
              onClick={() => setType("GOT")}
              className={`py-3 rounded-lg font-semibold ${
                type === "GOT"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              You Got
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </label>

              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                required
                min="1"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Note
              </label>

              <input
                type="text"
                placeholder="e.g. Grocery purchase"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Add Transaction
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

export default AddTransaction;