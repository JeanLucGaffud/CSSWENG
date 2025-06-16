import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req) {
  try {
    const body = await req.json();

    await connectToDatabase();

    const {
      salesmanID,
      customerName,
      paymentAmt,
      paymentMethod,
      dateMade,
      contactNumber,
      salesmanNotes,
    } = body;

    const newOrder = await Order.create({
      salesmanID,
      customerName,
      invoice: null,
      paymentAmt,
      paymentMethod,
      dateMade,
      contactNumber,
      salesmanNotes,
      assignmentStatus: 'No Driver Assigned',
      driverAssignedID: null,
      orderStatus: 'Being Prepared',
      dateDelivered: null,
      deliveryReceivedBy: null,
      paymentReceived: null,
      paymentReceivedBy: null,
      driverNotes: null,
      secretaryNotes: null,
    });
    return new Response(JSON.stringify({ success: true, order: newOrder }), {
      status: 201,
    });

  } catch (err) {
    console.error('Order creation error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create order.' }), {
      status: 500,
    });
  }
}