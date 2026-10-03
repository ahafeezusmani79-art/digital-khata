import { useEffect, useState } from "react";
import Customers from "./Customers";

function Dashboard() {
  const [customerCount, setCustomerCount] = useState(0);
  const [totalGave, setTotalGave] = useState(0);
  const [totalGot, setTotalGot] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const [recentTransactions, setRecentTransactions] = useState([]);

  const [showCustomers, setShowCustomers] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const customersResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/customers`,
          {
            credentials: "include",
          }
        );

        const customersData = await customersResponse.json();

        if (customersResponse.ok) {
          setCustomerCount(customersData.customers.length);
        }

        const summaryResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/transactions/summary`,
          {
            credentials: "include",
          }
        );

        const summaryData = await summaryResponse.json();

        if (summaryResponse.ok) {
          setTotalGave(summaryData.totalGave);
          setTotalGot(summaryData.totalGot);

          setNetBalance(
            summaryData.totalGave - summaryData.totalGot
          );
        }

        const recentResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/transactions/recent`,
          {
            credentials: "include",
          }
        );

        const recentData = await recentResponse.json();

        if (recentResponse.ok) {
          setRecentTransactions(recentData.transactions);
        }
      } catch (error) {
        console.error(
          "Error fetching dashboard data:",
          error
        );
      }
    };

    fetchDashboardData();
  }, []);

  if (showCustomers) {
    return (
      <Customers
        onBack={() => setShowCustomers(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Digital Khata
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome to your dashboard
        </p>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">

          <button
            onClick={() => setShowCustomers(true)}
            className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            + Add Customer
          </button>

          <button
            onClick={() => setShowCustomers(true)}
            className="w-full sm:w-auto bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50"
          >
            View Customers
          </button>

        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

          <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
            <p className="text-slate-500">
              Total Customers
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {customerCount}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
            <p className="text-slate-500">
              You Gave
            </p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              Rs. {totalGave}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
            <p className="text-slate-500">
              You Got
            </p>

            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
              Rs. {totalGot}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
            <p className="text-slate-500">
              Net Balance
            </p>

            <h2
              className={`text-3xl font-bold mt-2 ${
                netBalance > 0
                  ? "text-red-600"
                  : netBalance < 0
                  ? "text-emerald-600"
                  : "text-slate-700"
              }`}
            >
              Rs. {Math.abs(netBalance)}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {netBalance > 0
                ? "You are owed"
                : netBalance < 0
                ? "You owe"
                : "Balanced"}
            </p>
          </div>

        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mt-8">

          <h2 className="text-xl font-bold text-slate-800">
            Recent Transactions
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Your latest Khata activity
          </p>

          <div className="mt-5">

            {recentTransactions.length === 0 ? (
              <p className="text-slate-500">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-3">

                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >

                    <div>
                      <p className="font-semibold text-slate-800">
                        {transaction.customerId?.name ||
                          "Customer"}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {transaction.note || "Transaction"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
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
                ))}

              </div>
            )}

          </div>

        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto mt-8 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Dashboard;