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
      password,
      adminPassword
    } = await request.json();

    // Validate admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "Invalid administrative password" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Remove unverified duplicate if it exists
    const unverifiedUser = await User.findOne({ phoneNumber, isVerified: false });
    if (unverifiedUser) {
      await User.deleteOne({ phoneNumber, isVerified: false });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json(
        { message: "Phone Number already registered with an account" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      lastName,
      firstName,
      phoneNumber,
      role,
      passwordHash: hashedPassword,
      isVerified: true, // Immediately verified after admin confirmation
      status: "Inactive"
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User successfully registered and verified." },
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
