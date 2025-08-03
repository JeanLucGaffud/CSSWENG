import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request) {
    try {
        const { 
            orderId,
            driverNotes,
        } = await request.json();

        if (!orderId) {
            return new Response(JSON.stringify({ error: 'Missing orderID.' }), 
            {status: 400,});
        }
        
        await connectToDatabase();

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.name) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userName = session.user.name;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                driverNotes,
                lastModified: userName,
            },
            { new: true }).populate('salesmanID', 'firstName lastName').populate('driverAssignedID', 'firstName lastName');

            if (!updatedOrder) {
            return new Response(JSON.stringify({ error: 'Order not found.' }), 
            {status: 404,});
        }

    
        return new Response(JSON.stringify({ success: true, updatedOrder }), {
            status: 200,
        });

    } catch (error) {
        console.error('Order driver note update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update order driver notes.' }), {
            status: 500,
        });
    }
}