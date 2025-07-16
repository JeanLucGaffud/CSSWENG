import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

// --- GET: Fetch order history for logged-in Secretary (Criteria is Delivered or Cancelled and paymentAmt == paymentReceived) ---
export async function GET(req) {
    try {
        await connectToDatabase();

        const orders = await Order.find({
            orderStatus: { $in: ["Delivered", "Cancelled"] },
            $expr: { $eq: ["$paymentReceived", "$paymentAmt"] }
        })
        .sort({ createdAt: -1 })
        .lean();

        const safeOrders = Array.isArray(orders) ? orders : [];

        return new Response(JSON.stringify(safeOrders), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (err) {
        console.error('Order fetch error:', err);
        return new Response(JSON.stringify([]), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}