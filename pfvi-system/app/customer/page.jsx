'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompactOrderCard from '../../components/order_card_customer';

export default function Home() {
  const router = useRouter();

  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!orderId) {
      setError('Please enter a valid Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (response.ok) {
        setOrderDetails(data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('An error occurred while fetching the order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 text-gray-800 flex flex-col items-center pt-12 px-4">
      <div className="w-full max-w-2xl mt-10 bg-white backdrop-blur-md p-6 rounded-lg shadow-md border border-blue-900 flex flex-col items-center justify-center">

        {/* Back to Homepage Button */}
        <button
          onClick={() => router.push('/login')}
          className="self-start mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition"
        >
          ← Back to homepage
        </button>

        <img src="/logo.png" alt="Company Logo" className="w-40 h-auto mb-6" />

        <h1 className="text-xl font-semibold text-gray-800 mb-3 text-center">
          Enter your Order ID to view your order details.
        </h1>

        <input
          type="text"
          placeholder="Enter Order ID"
          className="w-full p-3 mb-4 rounded border border-gray-300 bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        <button
          className="w-full p-3 bg-blue-800 hover:bg-blue-950 text-white font-semibold rounded transition duration-200"
          onClick={handleSubmit}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>

        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

        {orderDetails && !loading && (
          <div className="mt-8 w-full max-w-4xl">
            <CompactOrderCard order={orderDetails} />
          </div>
        )}
      </div>
    </div>
  );
}
