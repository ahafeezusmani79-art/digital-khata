import { useEffect, useState } from "react";
import AddTransaction from "./AddTransaction";

function CustomerKhata({ customer, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(
    customer.currentBalance
  );

  const [totalGiven, setTotalGiven] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editType, setEditType] = useState("GAVE");
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${customer._id}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);

        const given = data.transactions
          .filter((transaction) => transaction.type === "GAVE")
          .reduce(
            (total, transaction) => total + transaction.amount,
            0
          );

        const received = data.transactions
          .filter((transaction) => transaction.type === "GOT")
          .reduce(
            (total, transaction) => total + transaction.amount,
            0
          );

        setTotalGiven(given);
        setTotalReceived(received);

        setCurrentBalance(given - received);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [customer._id]);

  const handleDeleteTransaction = async (transactionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${transactionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete transaction");
        return;
      }

      await fetchTransactions();
    } catch (error) {
      console.error("Delete transaction error:", error);
      alert("Something went wrong");
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setEditType(transaction.type);
    setEditAmount(transaction.amount.toString());
    setEditNote(transaction.note || "");
    setEditMessage("");
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();

    setEditMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${editingTransaction._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: editType,
            amount: Number(editAmount),
            note: editNote.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEditMessage(
          data.message || "Failed to update transaction"
        );
        return;
      }

      setEditingTransaction(null);
      await fetchTransactions();
    } catch (error) {
      console.error("Update transaction error:", error);
      setEditMessage("Something went wrong");
    }
  };

  if (showAddTransaction) {
    return (
      <AddTransaction
        customer={customer}
        onBack={() => setShowAddTransaction(false)}
        onTransactionAdded={(newBalance) => {
          setShowAddTransaction(false);
          setCurrentBalance(newBalance);
          fetchTransactions();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Back button */}
        <button
          onClick={onBack}
          className="text-emerald-600 font-semibold hover:underline"
        >
          ← Back to Customers
        </button>

        {/* Customer Summary */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mt-6">

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 break-words">
            {customer.name}
          </h1>

          <p className="text-slate-500 mt-2 break-all">
            {customer.phone}
          </p>

          {/* Current Balance */}
          <div className="mt-6">

            <p className="text-slate-500">
              Current Balance
            </p>

            <p
              className={`text-3xl sm:text-4xl font-bold mt-2 ${
                currentBalance > 0
                  ? "text-red-600"
                  : currentBalance < 0
                  ? "text-emerald-600"
                  : "text-slate-700"
              }`}
            >
              Rs. {Math.abs(currentBalance)}
            </p>

            <p
              className={`mt-2 font-medium ${
                currentBalance > 0
                  ? "text-red-600"
                  : currentBalance < 0
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              {currentBalance > 0
                ? "Customer owes you"
                : currentBalance < 0
                ? "You owe customer"
                : "No balance"}
            </p>

            {/* WhatsApp Reminder */}
            {currentBalance > 0 && (
              <button
                onClick={() => {
                  const phone = customer.phone
                    .replace(/\D/g, "")
                    .replace(/^0/, "92");

                  const message = `Assalam-o-Alaikum ${customer.name}, your outstanding balance is Rs. ${currentBalance}. Please make the payment at your convenience. Thank you.`;

                  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
                    message
                  )}`;

                  window.open(whatsappUrl, "_blank");
                }}
                className="w-full sm:w-auto mt-5 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Send WhatsApp Reminder
              </button>
            )}

          </div>

          {/* Given / Received */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

            <div className="bg-red-50 rounded-xl p-5">
              <p className="text-slate-500">
                Total Given
              </p>

              <p className="text-2xl font-bold text-red-600 mt-2">
                Rs. {totalGiven}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-5">
              <p className="text-slate-500">
                Total Received
              </p>

              <p className="text-2xl font-bold text-emerald-600 mt-2">
                Rs. {totalReceived}
              </p>
            </div>

          </div>

          {/* Add Transaction */}
          <button
            onClick={() => setShowAddTransaction(true)}
            className="w-full sm:w-auto mt-6 bg-emerald-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            + Add Transaction
          </button>

        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mt-6">

          <h2 className="text-xl font-bold text-slate-800">
            Transactions
          </h2>

          <div className="mt-5">

            {loading ? (
              <p className="text-slate-500">
                Loading transactions...
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-slate-500">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-4">

                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="border border-slate-200 rounded-xl p-4"
                  >

                    {/* Transaction information */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 break-words">
                          {transaction.note || "Transaction"}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(
                            transaction.date
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">

                        <p
                          className={`text-lg font-bold ${
                            transaction.type === "GAVE"
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {transaction.type === "GAVE"
                            ? "+"
                            : "-"}{" "}
                          Rs. {transaction.amount}
                        </p>

                        <p className="text-sm text-slate-500">
                          {transaction.type === "GAVE"
                            ? "You Gave"
                            : "You Got"}
                        </p>

                      </div>

                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditClick(transaction)
                        }
                        className="w-full sm:w-auto bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTransaction(
                            transaction._id
                          )
                        }
                        className="w-full sm:w-auto bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

        {/* Edit Transaction */}
        {editingTransaction && (
          <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mt-6">

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Edit Transaction
            </h2>

            <p className="text-slate-500 mt-2">
              Update transaction details
            </p>

            {/* Transaction Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

              <button
                type="button"
                onClick={() => setEditType("GAVE")}
                className={`py-3 rounded-lg font-semibold ${
                  editType === "GAVE"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                You Gave
              </button>

              <button
                type="button"
                onClick={() => setEditType("GOT")}
                className={`py-3 rounded-lg font-semibold ${
                  editType === "GOT"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                You Got
              </button>

            </div>

            <form
              onSubmit={handleUpdateTransaction}
              className="mt-6 space-y-5"
            >

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>

                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) =>
                    setEditAmount(e.target.value)
                  }
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
                  value={editNote}
                  onChange={(e) =>
                    setEditNote(e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Grocery purchase"
                />
              </div>

              {/* Form buttons */}
              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingTransaction(null);
                    setEditMessage("");
                  }}
                  className="w-full sm:flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-300"
                >
                  Cancel
                </button>

              </div>

              {editMessage && (
                <p className="text-center text-sm text-red-600">
                  {editMessage}
                </p>
              )}

            </form>

          </div>
        )}

      </div>
    </div>
  );
}

export default CustomerKhata;