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

    // Find the existing user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    if (user.isVerified) {
      return NextResponse.json(
        { message: "User is already verified by admin." },
        { status: 409 }
      );
    }

    // Mark user as verified by admin (but NOT active yet)
    user.isVerified = true;
    await user.save();

    return NextResponse.json(
      {
        message: "User verified by admin. Please set your password to activate your account.",
        phoneNumber: user.phoneNumber
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