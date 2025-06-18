import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";


const ADMIN_PASSWORD = "Admin1234"; // placeholder for now. should be stored in env.local

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

    // Determine redirect URL based on role
    let redirectUrl = "/";
    switch (user.role) {
      case "secretary":
        redirectUrl = "/secretary";
        break;
      case "salesman":
        redirectUrl = "/salesman";
        break;
      case "driver":
        redirectUrl = "/driver";
        break;
      default:
        redirectUrl = "/";
    }

    return NextResponse.json(
      { 
        message: "Account activated successfully",
        role: user.role,
        redirectUrl: redirectUrl
      },
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