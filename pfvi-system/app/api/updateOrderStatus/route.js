import { connectToDatabase } from '@/lib/mongodb';

import Order from '@/models/Order';


// --- POST: Update order status ---
export async function POST(request) {
    try {

        const { 
            orderId,
            newStatus,
            deliveryDate,
            deliveryReceivedBy,
            paymentReceived,
            paymentReceivedBy,
        } = await request.json();

        if (!orderId || !newStatus) {
            return new Response(JSON.stringify({ error: 'Missing orderID or newStatus.' }), 
            {status: 400,});
        }

        await connectToDatabase();

        const updateFields = {
            orderStatus: newStatus,
        };

        if (newStatus === "Delivered") {
            updateFields.dateDelivered = deliveryDate;
            updateFields.deliveryReceivedBy = deliveryReceivedBy;
            updateFields.paymentReceived = paymentReceived;
            updateFields.paymentReceivedBy = paymentReceivedBy;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, // changed this to lowercase "d"
            updateFields,
            { new: true });

        if (!updatedOrder) {
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