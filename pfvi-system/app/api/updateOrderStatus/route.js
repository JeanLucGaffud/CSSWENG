import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import Order from '@/models/Order';


// --- POST: Update order status ---
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.name) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userName = session.user.name;

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
            [`statusTimestamps.${newStatus}`]: new Date(),
            lastModified: userName
        };

        if (newStatus === "Delivered") {
            updateFields.dateDelivered = deliveryDate || new Date();
            updateFields.deliveryReceivedBy = deliveryReceivedBy || null;
            updateFields.paymentReceived = paymentReceived || null;
            updateFields.paymentReceivedBy = paymentReceivedBy || null;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, // changed this to lowercase "d"
            updateFields,
            { new: true }).populate('salesmanID', 'firstName lastName').populate('driverAssignedID', 'firstName lastName');

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