'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/order_card";


export default function Home() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    const fakeOrders = [
      {
        _id: "68500aa6118873002136250d",
        salesmanID: "68356e9ea691545a58ead78e",
        customerName: "US3 Backend Test 9",
        invoice: null,
        paymentAmt: 69420.21,
        paymentMethod: "Cash",
        dateMade: "2025-06-16T00:00:00.000+00:00",
        contactNumber: "09086535995",
        assignmentStatus: "No Driver Assigned",
        driverAssignedID: null,
        orderStatus: "Being Prepared",
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        salesmanNotes: "ISA PA!!",
        driverNotes: null,
        secretaryNotes: null,
      },
       {
        _id: "68500aa611887300213dddd",
        salesmanID: "68356e9ea691545a58ead78e",
        customerName: "US3 Backend Test 9",
        invoice: null,
        paymentAmt: 69420.21,
        paymentMethod: "Cash",
        dateMade: "2025-06-16T00:00:00.000+00:00",
        contactNumber: "09086535995",
        assignmentStatus: "No Driver Assigned",
        driverAssignedID: null,
        orderStatus: "Being Prepared",
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        salesmanNotes: "ISA PA!!",
        driverNotes: null,
        secretaryNotes: null,
      },
       {
        _id: "68500aa611887300213xxxxx",
        salesmanID: "68356e9ea691545a58ead78e",
        customerName: "US3 Backend Test 9",
        invoice: null,
        paymentAmt: 69420.21,
        paymentMethod: "Cash",
        dateMade: "2025-06-16T00:00:00.000+00:00",
        contactNumber: "09086535995",
        assignmentStatus: "No Driver Assigned",
        driverAssignedID: null,
        orderStatus: "Being Prepared",
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        salesmanNotes: "ISA PA!!",
        driverNotes: null,
        secretaryNotes: null,
      },
    ];
    setOrders(fakeOrders);
  }, []);

  
  const handleFilterClick = (filterOption) => {
    setFilter(filterOption);
    setIsDropdownOpen(false); // Close dropdown after selecting an option
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility on click
  };

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">

      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="flex-col w-50 p-3">
     
          <button
            className="w-40 bg-blue-900 text-white font-semibold block px-6 py-3 mb-5 rounded hover:text-white hover:bg-blue-950 transition duration-200 text-center"
             onClick={() => router.push('/salesman/createOrder')}
          >
            Create Order
          </button>
          <SignOutButton 
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" 
          />
          
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-15 overflow-y-auto">
        {/* Search Bar */}
       <div className="mb-6 flex items-center space-x-3">
          {/* Filter Button */}
          <div className="relative">
            <button 
              className="p-3  bg-blue-900 text-white rounded shadow-md"
              onClick={toggleDropdown} // Toggle dropdown on button click
            >
              Filter
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 bg-white text-black rounded shadow-lg mt-2 w-48">
                <ul>
                  {['Recent', 'Oldest', 'Delivered', 'Cancelled', 'Not Received'].map((option) => (
                    <li 
                      key={option} 
                      className="cursor-pointer hover:bg-gray-200 p-2"
                      onClick={() => handleFilterClick(option)} // Set filter and close dropdown
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <input
            type="search"
            placeholder="Search..."
            className="w-3/4 p-3 rounded border border-black bg-white/10 text-black"
          />
        </div>

        {/* Orders */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Orders</h2>
          <p className="text-lg font-semibold text-black">Welcome back, Salesman!</p>
        </div>
        <div className="flex flex-col space-y-4 pb-6">
          {orders.map((order) => (
            <CompactOrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}