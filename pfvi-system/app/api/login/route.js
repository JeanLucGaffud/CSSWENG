import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // Import cookies

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

    // Check if user is active
    if (user.status !== 'Active') {
      return NextResponse.json(
        { message: "Account is not active. Please contact an administrator." },
        { status: 403 }
      );
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // User authenticated successfully
    // Omit passwordHash from the response
    const { passwordHash, ...userWithoutPassword } = user.toObject();

    // Set authentication cookie
    cookies().set({
      name: 'auth_session',
      value: JSON.stringify({
        id: user._id.toString(),
        role: user.role,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }),
      httpOnly: true, // Cannot be accessed by client-side JavaScript
      path: '/',      // Available across the entire site
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // Protection against CSRF
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

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