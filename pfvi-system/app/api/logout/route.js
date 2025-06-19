import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Clear the auth cookie
  const cookieStore = await cookies();

  // Delete all auth-related cookies
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('next-auth') || cookie.name === 'auth_session') {
      cookieStore.delete(cookie.name);
    }
  }
  
  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}