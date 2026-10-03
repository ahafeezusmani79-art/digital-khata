import { useEffect, useState } from "react";
import AddCustomer from "./AddCustomer";
import CustomerKhata from "./CustomerKhata";

function Customers({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Edit customer states
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCreditLimit, setEditCreditLimit] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(searchText) ||
      customer.phone.includes(searchText)
    );
  });

  const totalCustomers = customers.length;

  const customersWhoOweYou = customers.filter(
    (customer) => customer.currentBalance > 0
  ).length;

  const customersYouOwe = customers.filter(
    (customer) => customer.currentBalance < 0
  ).length;

  const zeroBalanceCustomers = customers.filter(
    (customer) => customer.currentBalance === 0
  ).length;

  // Open edit form
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditCreditLimit(customer.creditLimit);
    setEditMessage("");
  };

  // Update customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    setEditMessage("");

    if (editName.trim().length < 2) {
      setEditMessage(
        "Customer name must be at least 2 characters."
      );
      return;
    }

    if (editPhone.trim().length < 10) {
      setEditMessage("Please enter a valid phone number.");
      return;
    }

    const limit = Number(editCreditLimit);

    if (isNaN(limit) || limit < 0) {
      setEditMessage("Credit limit cannot be negative.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers/${editingCustomer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: editName.trim(),
            phone: editPhone.trim(),
            creditLimit: limit,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEditMessage(
          data.message || "Failed to update customer"
        );
        return;
      }

      setEditingCustomer(null);

      await fetchCustomers();
    } catch (error) {
      console.error("Update customer error:", error);
      setEditMessage("Unable to connect to server.");
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (
    customerId,
    customerName
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${customerName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers/${customerId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete customer");
        return;
      }

      await fetchCustomers();
    } catch (error) {
      console.error("Delete customer error:", error);
      alert("Unable to connect to server.");
    }
  };

  if (selectedCustomer) {
    return (
      <CustomerKhata
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
      />
    );
  }

  if (showAddCustomer) {
    return (
      <AddCustomer
        onBack={() => setShowAddCustomer(false)}
        onCustomerAdded={fetchCustomers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Top buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <button
            onClick={onBack}
            className="w-full sm:w-auto text-emerald-600 font-semibold hover:underline text-left"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => setShowAddCustomer(true)}
            className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            + Add Customer
          </button>

        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Customers
        </h1>

        <p className="text-slate-500 mt-2">
          Manage your Khata customers
        </p>

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-slate-500">
              Total Customers
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalCustomers}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-slate-500">
              They Owe You
            </p>

            <h2 className="text-2xl font-bold text-red-600 mt-2">
              {customersWhoOweYou}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-slate-500">
              You Owe
            </p>

            <h2 className="text-2xl font-bold text-emerald-600 mt-2">
              {customersYouOwe}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-slate-500">
              Zero Balance
            </p>

            <h2 className="text-2xl font-bold text-slate-700 mt-2">
              {zeroBalanceCustomers}
            </h2>
          </div>

        </div>

        {/* Customer list */}
        <div className="mt-8">

          {loading ? (
            <p className="text-slate-500">
              Loading customers...
            </p>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-6">
              <p className="text-slate-500">
                {search
                  ? "No customers found."
                  : "No customers added yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="bg-white rounded-2xl shadow p-5 sm:p-6 hover:shadow-xl transition"
                >

                  {/* Customer information */}
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(customer)}
                    className="w-full text-left"
                  >

                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 break-words">
                      {customer.name}
                    </h2>

                    <p className="text-slate-500 mt-2 break-all">
                      {customer.phone}
                    </p>

                    <p className="text-slate-500 mt-4">
                      Balance
                    </p>

                    <p
                      className={`text-2xl font-bold ${
                        customer.currentBalance > 0
                          ? "text-red-600"
                          : customer.currentBalance < 0
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      Rs. {Math.abs(customer.currentBalance)}
                    </p>

                  </button>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCustomer(customer)
                      }
                      className="text-sm text-emerald-600 font-medium hover:underline text-left"
                    >
                      Open Khata →
                    </button>

                    <div className="flex gap-2 w-full sm:w-auto">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditClick(customer)
                        }
                        className="flex-1 sm:flex-none bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteCustomer(
                            customer._id,
                            customer.name
                          )
                        }
                        className="flex-1 sm:flex-none bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Edit Customer Form */}
        {editingCustomer && (
          <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mt-8">

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Edit Customer
            </h2>

            <p className="text-slate-500 mt-2">
              Update customer information
            </p>

            <form
              onSubmit={handleUpdateCustomer}
              className="mt-6 space-y-5"
            >

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
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
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(e.target.value)
                  }
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
                  value={editCreditLimit}
                  onChange={(e) =>
                    setEditCreditLimit(e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                  required
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
                    setEditingCustomer(null);
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

export default Customers;