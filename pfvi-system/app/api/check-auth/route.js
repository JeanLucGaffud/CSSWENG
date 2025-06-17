import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Get the auth cookie
    const authCookie = cookies().get('auth_session');
    
    if (!authCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Parse the cookie value
    const userData = JSON.parse(authCookie.value);
    
    if (!userData || !userData.id || !userData.role) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Database verification - check if user still exists
    try {
      await connectToDatabase();
      const user = await User.findById(userData.id);
      
      // If user doesn't exist or is not active
      if (!user || user.status !== 'Active') {
        // Clear the invalid cookie
        cookies().delete('auth_session');
        
        return NextResponse.json(
          { authenticated: false, message: "User account no longer exists or is inactive" },
          { status: 401 }
        );
      }
    } catch (dbError) {
      console.error("Database verification error:", dbError);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        role: userData.role,
        name: userData.name
      }
    });
    
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}