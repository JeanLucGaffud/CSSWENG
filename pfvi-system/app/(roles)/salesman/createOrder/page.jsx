'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CreateOrder() {
  const router = useRouter();
  const { data: session } = useSession();

  const [customerName, setCustomerName] = useState('');
  const [paymentAmt, setPaymentAmt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [dateMade, setDateMade] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [salesmanNotes, setSalesmanNotes] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);

    const orderData = {
      salesmanID: session?.user?.id,
      customerName,
      paymentAmt: parseFloat(paymentAmt),
      paymentMethod,
      dateMade,
      contactNumber,
      salesmanNotes,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Something went wrong');

      setShowConfirm(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        router.push('/salesman');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to create order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white bg-opacity-90 shadow">
        <img src="/logo.png" alt="Company Logo" className="w-24 h-auto" />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          onClick={() => router.push('/salesman')}
        >
          Back
        </button>
      </div>

      {/* Sidebar (desktop) */}
      <div className="hidden md:block w-64 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="w-40 h-auto" />
        </div>
        <div className="flex justify-center">
          <button
            className="bg-blue-800 text-white font-bold px-6 py-3 rounded hover:bg-blue-900 transition"
            onClick={() => router.push('/salesman')}
          >
            Back
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-950 p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Create Order</h2>
          <p className="text-sm sm:text-base mt-1">
            Fill in all required fields to create a new order. Make sure the information is accurate before submitting.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 sm:p-6 rounded-lg border border-blue-900 shadow-md space-y-4 text-blue-950"
        >
          {/* Customer Name */}
          <div>
            <label className="block font-semibold" htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              required
            />
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block font-semibold" htmlFor="paymentAmt">Payment Amount</label>
            <input
              type="number"
              id="paymentAmt"
              value={paymentAmt}
              onChange={(e) => setPaymentAmt(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold" htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              required
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Date Made */}
          <div>
            <label className="block font-semibold" htmlFor="dateMade">Date Made</label>
            <input
              type="date"
              id="dateMade"
              value={dateMade}
              onChange={(e) => setDateMade(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              required
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-semibold" htmlFor="contactNumber">Contact Number/Details</label>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              required
            />
          </div>

          {/* Salesman Notes */}
          <div>
            <label className="block font-semibold" htmlFor="salesmanNotes">Notes</label>
            <textarea
              id="salesmanNotes"
              value={salesmanNotes}
              onChange={(e) => setSalesmanNotes(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              rows="4"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={showConfirm}
              className={`bg-green-600 text-white font-bold px-6 py-3 rounded transition ${
                showConfirm ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              } w-full sm:w-auto`}
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full shadow-lg text-blue-900">
            <h3 className="text-lg font-bold mb-4">Confirm Submission</h3>
            <div className="mb-6 text-sm space-y-1">
              <p><strong>Customer:</strong> {customerName}</p>
              <p><strong>Amount:</strong> ₱{parseFloat(paymentAmt || 0).toFixed(2)}</p>
              <p><strong>Method:</strong> {paymentMethod}</p>
              <p><strong>Date:</strong> {dateMade}</p>
              <p><strong>Contact:</strong> {contactNumber}</p>
              {salesmanNotes && <p><strong>Notes:</strong> {salesmanNotes}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white transition w-full sm:w-auto ${
                  isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-blue-900 text-center">
            <h3 className="text-lg sm:text-xl font-bold mb-4">✅ Order Created!</h3>
            <p className="text-sm">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
