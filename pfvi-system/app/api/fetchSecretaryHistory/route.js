import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

// --- GET: Fetch all orders for logged-in Secretary ---
export async function GET(req) {
    try {
        await connectToDatabase();

    const orders = await Order.find({})
        .sort({ createdAt: -1 });

    return new Response(JSON.stringify(orders), {
        status: 200,
    });

    } catch (err) {
    console.error('Order fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders.' }), {
        status: 500,
    });
    }
}