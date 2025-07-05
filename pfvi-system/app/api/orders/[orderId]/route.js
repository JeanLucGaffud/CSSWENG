import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { Types } from 'mongoose';

export async function GET(req, context) {
  try {
    // Awaiting the context params (this ensures the params are available)
    const { orderId } = await context.params;  

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is missing' }),
        { status: 400 }
      );
    }

    // Debugging log for the orderId
    console.log('Fetching order with ID:', orderId);

    await connectToDatabase();

    // Fetch the order by _id (MongoDB's ObjectId format)
    const order = await Order.findById(new Types.ObjectId(orderId));

    // Log the order data
    console.log('Fetched order:', order);

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