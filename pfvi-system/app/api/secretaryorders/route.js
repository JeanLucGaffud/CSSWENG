import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust path as needed
import { Types } from "mongoose";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Get session from request
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    } else { 
        console.log('Session user ID:', session.user.id);
    }

    // Use the user ID from the session
    const salesmanID = session.user.id;

    const orders = await Order.find()
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(orders), { status: 200 });

  } catch (err) {
    console.error('Order fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders.' }), {
      status: 500,
    });
  }
}