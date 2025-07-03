'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompactOrderCard from '../../components/order_card';

export default function Home() {
  const router = useRouter();
  
  // State variables for orderId and orderDetails
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle order ID submission
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
    <div className="min-h-screen w-screen bg-[url('/background.jpg')] bg-cover bg-center text-white flex flex-col items-center pt-12">
      <img src="/logo.png" alt="Company Logo" className="w-40 h-auto mb-8" />

      <div className="bg-blue-100 backdrop-blur-md p-8 rounded-lg shadow-md border border-blue-900 flex-col items-center">
        <h1 className="text-xl font-semibold text-blue-950 mb-6">Enter your Order ID to view your order details.</h1>

        <input
          type="text"
          placeholder="Enter Order ID"
          className="w-full p-3 mb-4 rounded border border-black bg-white/90 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        <button
          className="w-full p-3 bg-blue-800 hover:bg-blue-950 text-white font-semibold rounded transition duration-200"
          onClick={handleSubmit}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {orderDetails && !loading && (
          <div className="mt-8 w-full max-w-4xl">
            <CompactOrderCard order={orderDetails} />
          </div>
        )}
      </div>
    </div>
  );
}