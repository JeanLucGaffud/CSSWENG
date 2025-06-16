'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateOrder() {
  const router = useRouter();

  // State for form fields
  const [salesmanID, setSalesmanID] = useState('68356e9ea691545a58ead78e'); // IMPORTANT: Temporarily Hardcoded. Update after Auth Sessions
  const [customerName, setCustomerName] = useState('');
  const [paymentAmt, setPaymentAmt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [dateMade, setDateMade] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [salesmanNotes, setSalesmanNotes] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      salesmanID,
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

      alert('Order created successfully!');
      router.push('/salesman'); // Redirect after success

    } catch (err) {
      console.error(err);
      alert('Failed to create order.');
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
        <form onSubmit={handleSubmit} className="bg-blue-100 p-8 rounded-lg border border-blue-900 shadow-md space-y-4 text-blue-950">

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
            <label className="block text-blue-900 font-semibold" htmlFor="contactNumber">Contact Number</label>
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
              className="bg-green-600 text-white font-bold px-6 py-3 rounded hover:bg-green-700 transition duration-200"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}