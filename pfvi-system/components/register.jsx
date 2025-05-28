"use client"

import { Eye, EyeOff, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [error, setError] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [selectedRole, setSelectedRole] = useState("")

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const router = useRouter() 

  {/*Validation*/}
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  //For checking
  console.log("Last Name:", lastName);
  console.log("First Name:", firstName);
  console.log("Phone Number:", phoneNumber);
  console.log("Role:", selectedRole);
  console.log("Password:", password);
  console.log("Confirm Password:", confirmPassword);
  
  if(password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastName,
        firstName,
        phoneNumber,
        role: selectedRole,
        password,
      }),
    });

    if (res.ok) {
        const form = e.target;
        setLastName("");
        setFirstName("");
        setPhoneNumber("");
        setSelectedRole("");
        setPassword("");
        setConfirmPassword("");
        router.push(`/password?phoneNumber=${encodeURIComponent(phoneNumber)}`); // Redirect to password page with phone number as query parameter
      } else {
        // Registration failed
        const data = await res.json();
        setError(data.message);
        console.log("Registration failed:", data.message);
        alert(data.message);
      }

  } catch (error) {
    console.error("An error occured while registering:", error);
  }
};

  return (
    <div className="min-h-screen bg-custom flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
        
        {/* header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500">Sign up to get started</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="space-y-4">
            {/* last name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Enter your name"
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            {/* first name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Enter your name"
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            {/* phone # */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                placeholder="Enter your phone number"
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            {/* role*/}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
                <div className="relative">
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors appearance-none"
                    required
                >
                    <option value="" disabled>Select your role</option>
                    <option value="salesman">Salesman</option>
                    <option value="driver">Driver</option>
                    <option value="secretary">Secretary</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* confirm password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* sign up button */}
            <button
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
                Create account
            </button>

          {/* sign in link */}
            <p className="text-center text-sm text-gray-600">
                {"Already have an account? "}
                <button type="button" onClick={() => router.push('/login')} className="text-gray-900 hover:underline font-medium transition-colors">
                Sign in
                </button>
            </p>

        </form>
        
      </div>
    </div>
  )
}