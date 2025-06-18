import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Clear the auth cookie
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  
  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}