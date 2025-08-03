import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return NextResponse.json(
        { message: "User ID and new password are required" }, 
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" }, 
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    user.passwordHash = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-password route:", error);
    return NextResponse.json(
      { message: "Error resetting password", error: error.message }, 
      { status: 500 }
    );
  }
}