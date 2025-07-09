import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { phoneNumber, newPassword } = await request.json();
    await connectToDatabase();

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (!user.isVerified) {
      return NextResponse.json({ message: "User not verified by admin" }, { status: 403 });
    }
    if (user.status === "Active") {
      return NextResponse.json({ message: "Account is already active." }, { status: 409 });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.status = "Active";
    await user.save();

    return NextResponse.json({ message: "Password set and account activated" }, { status: 200 });
  } catch (error) {
    console.error("Error in set-password route:", error);
    return NextResponse.json({ message: "Error setting password" }, { status: 500 });
  }
}