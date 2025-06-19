'use client';

import { useState, useEffect } from 'react';
import SignOutButton from "@/components/signout_button";

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fakeOrders = [
      { id: 1, title: "Order #1", salesman: "Salesman: Andre", driver: "Driver: Carlos", status: "status: fulfilled" ,date: "2025-05-26" },
      { id: 2, title: "Order #2", salesman: "Salesman: Andre", driver: "Driver: Carlos", status: "status: fulfilled" ,date: "2025-05-25" },
      { id: 3, title: "Order #3", salesman: "Salesman: Andre", driver: "Driver: Carlos", status: "status: pending" ,date: "2025-05-24" },
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

          <SignOutButton 
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" 
          />
          
        </div>

        <ul className="ml-6 space-y-3  border-1 border-gray-900 rounded w-40">
          {['Orders'].map((item) => (
            <li key={item}>
              <a
                href="#"
                className="font-bold block px-4 py-2 rounded text-white bg-blue-900 text-center"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

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
          <p className="text-lg font-semibold text-black">Welcome back, Secretary!</p>
        </div>
        <div className="flex flex-col space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white text-black p-6 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold">{order.title}</h3>
                <p>{order.salesman}</p>
                <p>{order.driver}</p>
                <p>{order.status}</p>
              </div>
              <span className="text-sm text-gray-500">{order.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}