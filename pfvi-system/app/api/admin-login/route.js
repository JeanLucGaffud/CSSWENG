/**
 * This API route handles administrative authentication.
 * Validates admin credentials and redirects user to a homepage based on their role.
 */

import { NextResponse } from "next/server";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "Admin1234"
};

export async function POST(request) {
  try {
    const { username, password, role } = await request.json();

    // Validate admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Determine redirect URL based on role
      let redirectTo = "/";
      switch (role) {
        case "secretary":
          redirectTo = "/secretary";
          break;
        case "salesman":
          redirectTo = "/salesman";
          break;
        case "driver":
          redirectTo = "/driver";
          break;
        default:
          redirectTo = "/";
      }

      return NextResponse.json(
        { message: "Admin authenticated successfully", redirectTo },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid admin credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    return NextResponse.json(
      { message: "An error occurred during admin authentication" },
      { status: 500 }
    );
  }
}
