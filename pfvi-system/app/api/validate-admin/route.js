import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request) {
  try {
    const { adminPassword, phoneNumber } = await request.json();
    
    // Validate admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "Invalid administrative password" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find the user and update their status
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Update user status to Active
    user.status = 'Active';
    await user.save();

    return NextResponse.json(
      { message: "Account activated successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error during admin validation:", error);
    return NextResponse.json(
      { message: "An error occurred during validation" },
      { status: 500 }
    );
  }
}