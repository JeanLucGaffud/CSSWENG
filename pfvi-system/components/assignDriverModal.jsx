"use client";
import { useEffect, useState } from "react";

export default function AssignDriverModal({ order, onClose, onAssign }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    async function fetchDrivers() {
      const res = await fetch("/api/drivers/with-load");
      const data = await res.json();
      setDrivers(data);
    }

    fetchDrivers();
  }, []);

  const confirmAssignment = () => {
    onAssign(selectedDriver._id);
    setConfirming(false);
    setSelectedDriver(null);
  };

  const currentDriver = drivers.find(
    (d) => String(d._id) === String(order.driverAssignedID?._id)
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex justify-center items-center z-50">
      <div className="bg-white text-gray-900 rounded-xl w-full max-w-2xl p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assign Driver</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-sm"
          >
            Close
          </button>
        </div>

        {/* Order Info */}
        <div className="mb-4 text-sm">
          <p>
            Customer: <strong>{order.customerName}</strong>
          </p>
          <p>
            Current Driver:{" "}
            <strong>
              {currentDriver
                ? `${currentDriver.firstName} ${currentDriver.lastName}`
                : "Not assigned"}
            </strong>
          </p>
        </div>

        {/* Driver List */}
        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {drivers.map((driver) => (
            <li
              key={driver._id}
              className="flex justify-between items-center border p-3 rounded hover:bg-blue-50 cursor-pointer"
              onClick={() => {
                setSelectedDriver(driver);
                setConfirming(true);
              }}
            >
              <div>
                <p className="font-medium">
                  {driver.firstName} {driver.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  Orders: {driver.orderCount}
                </p>
              </div>
              <span className="text-blue-600 font-semibold text-sm">
                Assign
              </span>
            </li>
          ))}
        </ul>

        {/* Confirmation Dialog */}
        {confirming && selectedDriver && (
          <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded text-sm space-y-3">
            <p>
              Confirm assignment of{" "}
              <strong>
                {selectedDriver.firstName} {selectedDriver.lastName}
              </strong>{" "}
              to order <code className="text-xs">{order._id}</code>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
