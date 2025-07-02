import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export default async function POST(request) {
    try {
        const { 
            orderId,
            driverNotes,
        } = await request.json();

        if (!orderId || !driverNotes) {
            return new Response(JSON.stringify({ error: 'Missing orderID or driverNote.' }), 
            {status: 400,});
        }
        
        await connectToDatabase();

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { driverNotes },
            { new: true });

            if (!updatedOrder) {
            return new Response(JSON.stringify({ error: 'Order not found.' }), 
            {status: 404,});
        }

    
        return new Response(JSON.stringify({ success: true, updatedOrder }), {
            status: 200,
        });

    } catch (error) {
        console.error('Order driver note update error:', err);
        return new Response(JSON.stringify({ error: 'Failed to update order driver notes.' }), {
            status: 500,
        });
    }
}