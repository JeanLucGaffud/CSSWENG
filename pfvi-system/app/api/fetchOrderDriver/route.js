import { connectToDatabase } from '@/lib/mongodb';
import { Types } from "mongoose";
import Order from '@/models/Order';

// --- GET: Fetch orders for logged-in driver ---
export async function GET(req) {
    try {
        await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const driverID = searchParams.get('driverID');

    if (!driverID) {
        return new Response(JSON.stringify({ error: 'Missing driverID' }), {
        status: 400,
        });
    }

    const orders = await Order.find({ driverAssignedID: new Types.ObjectId(driverID) })
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