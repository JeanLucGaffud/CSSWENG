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

    // Check if user already exists with the same phone number
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json(
        { message: "Phone Number already registered with an account" },
        { status: 409,
      });
    }

    // Creates a new user 
    const newUser = new User({
      lastName,
      firstName,
      role,
      phoneNumber,
      passwordHash: hashedPassword,
    });
    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" }, {
      status: 201,
    });

  } catch (error) {
    console.error("Error during registration", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: "Invalid phone number format. Please enter a valid philippine phone number." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}