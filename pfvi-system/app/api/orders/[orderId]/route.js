import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { Types } from 'mongoose';

// --- GET: Fetch order by orderId (MongoDB _id) ---
export async function GET(req, { params }) {
  const { orderId } = params;

  try {
    await connectToDatabase();

    // Fetch the order by _id (MongoDB's ObjectId format)
    const order = await Order.findById(new Types.ObjectId(orderId));

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(order), { status: 200 });
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch order' }),
      { status: 500 }
    );
  }
}