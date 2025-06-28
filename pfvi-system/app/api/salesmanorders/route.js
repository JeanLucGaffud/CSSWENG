import { connectToDatabase } from '@/lib/mongodb';
import { Types } from "mongoose";
import Order from '@/models/Order';

// --- POST: Create a new order ---
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

// --- GET: Fetch orders for logged-in salesman ---
export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const salesmanID = searchParams.get('salesmanID');

    if (!salesmanID) {
      return new Response(JSON.stringify({ error: 'Missing salesmanID' }), {
        status: 400,
      });
    }

    const orders = await Order.find({ salesmanID: new Types.ObjectId(salesmanID) })
    .sort({ createdAt: -1 }); // Sort by createdAt descending

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
