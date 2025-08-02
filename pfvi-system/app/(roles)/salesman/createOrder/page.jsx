'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CreateOrder() {
  const router = useRouter();

  // State for form fields

  const { data: session, status } = useSession();
  const [customerName, setCustomerName] = useState('');
  const [paymentAmt, setPaymentAmt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [dateMade, setDateMade] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [salesmanNotes, setSalesmanNotes] = useState('');

  // Confirmation modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [formEvent, setFormEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Order Creation Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormEvent(e);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      // Transitions from confirmation modal to success modal
      setShowConfirm(false);
      setShowSuccessModal(true);

      // Transitions from success modal back to salesman dashboard
      setTimeout(() => {
        router.push('/salesman');
      }, 2000);

    } catch (err) {
      console.error(err);
      alert('Failed to create order.');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="flex justify-center w-50 p-3">
          <button
            className="bg-blue-800 text-white font-bold block px-6 py-3 rounded hover:text-white hover:bg-blue-900 transition duration-200 text-center"
            onClick={() => router.push('/salesman')}
          >
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-15 overflow-y-auto">
        {/* Box container for form */}
        <div className="flex items-center mb-4 space-x-4">
          <div className="bg-blue-950 p-6 rounded-lg shadow-md flex flex-col justify-center items-start w-full">
            <h2 className="text-2xl font-bold text-white">Create Order</h2>
            <p className="text-lg text-white mt-1">
              Please fill in all the required fields to create a new customer order. Make sure the information is accurate before submitting.
            </p>
          </div>
        </div>

        {/* Form for creating a new order inside a blue container */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-blue-900 shadow-md space-y-4 text-blue-950">

          {/* Customer Name */}
          <div>
            <label className="block text-blue-900 font-semibold" htmlFor="customerName">Customer Name</label>
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
            <label className="block text-blue-900 font-semibold" htmlFor="paymentAmt">Payment Amount</label>
            <input
              type="number"
              id="paymentAmt"
              value={paymentAmt}
              onChange={(e) => setPaymentAmt(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              required
            />
          </div>

          {/* Payment Method (Dropdown) */}
          <div>
            <label className="block text-blue-900 font-semibold" htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900 text-blue-900 text-xs"
              required
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Date Made (Date Picker) */}
          <div>
            <label className="block text-blue-900 font-semibold" htmlFor="dateMade">Date Made</label>
            <input
              type="date"
              id="dateMade"
              value={dateMade}
              onChange={(e) => setDateMade(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // today's date
              className="w-full p-3 mt-2 rounded border border-blue-900 text-blue-900 text-xs"
              required
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-blue-900 font-semibold" htmlFor="contactNumber">Contact Number/Details</label>
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
            <label className="block text-blue-900 font-semibold" htmlFor="salesmanNotes">Notes</label>
            <textarea
              id="salesmanNotes"
              value={salesmanNotes}
              onChange={(e) => setSalesmanNotes(e.target.value)}
              className="w-full p-3 mt-2 rounded border border-blue-900"
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={showConfirm}
              className={`bg-green-600 text-white font-bold px-6 py-3 rounded transition duration-200 ${
                showConfirm ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-blue-900">
            <h3 className="text-lg font-bold mb-4">Confirm Submission</h3>
            
            <div className="mb-6 space-y-1 text-sm">
              <p><strong>Customer:</strong> {customerName}</p>
              <p><strong>Amount:</strong> ₱{parseFloat(paymentAmt || 0).toFixed(2)}</p>
              <p><strong>Method:</strong> {paymentMethod}</p>
              <p><strong>Date:</strong> {dateMade}</p>
              <p><strong>Contact:</strong> {contactNumber}</p>
              {salesmanNotes && <p><strong>Notes:</strong> {salesmanNotes}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setFormEvent(null);
                }}
                disabled={isLoading}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white transition ${
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
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-blue-900 text-center">
            <h3 className="text-xl font-bold mb-4">✅ Order Created!</h3>
            <p className="text-sm">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}