import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req) {
    console.log('Received request to update order status');
    try {
        const { 
            orderId,
            newStatus,
        } = await req.json();

        if (!orderId || !newStatus) {
            console.error('Missing orderId or newStatus in request body');
            return new Response(JSON.stringify({ error: 'Missing orderId or newStatus.' }), 
            {status: 400,});
        }

        await connectToDatabase();

        const order = mockOrders.find(o => o._id === orderId);
            if (!order) {
            return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
            );
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: newStatus },
            { new: true });

        if (!updatedOrder) {
            console.error(`Order with ID ${orderId} not found`);
            return new Response(JSON.stringify({ error: 'Order not found.' }), 
            {status: 404,});
        }

        return new Response(JSON.stringify({ success: true, updatedOrder }), {
            status: 200,
        });

    } catch (err) {
        console.error('Order status update error:', err);
        return new Response(JSON.stringify({ error: 'Failed to update order status.' }), {
            status: 500,
        });
    }
}