import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { 
      lastName,
      firstName,
      phoneNumber,
      role,  
      password
    } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    await connectToDatabase();

    // to remove unverified duplicate if it exists
    const unverifiedUser = await User.findOne({ phoneNumber, isVerified: false });
    if (unverifiedUser) {
      await User.deleteOne({ phoneNumber, isVerified: false });
    }

    // Check if user already exists (verified or not)
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json(
        { message: "Phone Number already registered with an account" },
        { status: 409 }
      );
    }

    // Create new user (not yet verified by admin)
    const newUser = new User({
      lastName,
      firstName,
      phoneNumber,
      role,
      passwordHash: hashedPassword,
      isVerified: false, // admin validation
      status: "Inactive"
    });

    await newUser.save();

    return NextResponse.json(
      { message: "Registration successful. Awaiting admin validation." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error during registration", error);
    return NextResponse.json(
      { message: "Error during registration" },
      { status: 500 }
    );
  }
}