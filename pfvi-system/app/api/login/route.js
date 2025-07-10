import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";


export async function POST(request) {
  try {
    const { phoneNumber, password } = await request.json();

    await connectToDatabase();

    // Find the user by phone number
    const user = await User.findOne({ phoneNumber });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Check if user is verified by admin
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Account not verified by admin. Please contact an administrator." },
        { status: 403 }
      );
    }

    // Compare passwords FIRST
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // If user is verified but inactive, require password change
    if (user.status === "Inactive") {
      return NextResponse.json(
        { message: "You must set a new password to activate your account.", requirePasswordChange: true },
        { status: 200 }
      );
    }

    // User authenticated successfully
    // Omit passwordHash from the response
    const { passwordHash, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { 
        message: "Login successful",
        user: userWithoutPassword
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}