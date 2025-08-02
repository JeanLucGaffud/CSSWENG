import { connectToDatabase } from '@/lib/mongodb';
import { Types } from "mongoose";
import Order from '@/models/Order';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- POST: Create a new order ---
export async function POST(req) {
  try {
    const body = await req.json();
    await connectToDatabase();

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const {
      salesmanID,
      customerName,
      paymentAmt,
      paymentMethod,
      dateMade,
      contactNumber,
      salesmanNotes,
    } = body;

    // Use session user ID if salesmanID is not provided
    const finalSalesmanID = salesmanID || session.user.id;

    const latestOrder = await Order.findOne().sort({ orderNumber: -1 });
    let nextOrderNumber;

    if (!latestOrder || typeof latestOrder.orderNumber !== 'number') {
      // Case 1: No orders exist OR existing orders don't have orderNumber
      const orderCount = await Order.countDocuments();
      nextOrderNumber = orderCount > 0 ? 1 : 1; // Start at 1
    } else {
      // Case 2: Orders exist with proper orderNumber
      nextOrderNumber = latestOrder.orderNumber + 1;
    }

    const newOrder = await Order.create({
      orderNumber: nextOrderNumber,
      salesmanID: finalSalesmanID,
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

// --- GET: Fetch orders (supports both salesman-specific and all orders) ---
export async function GET(req) {
  try {
    await connectToDatabase();

    // Get session from request
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const salesmanID = searchParams.get('salesmanID');
    const orderId = searchParams.get('orderId');
    const userRole = searchParams.get('role') || session.user?.role;

    // If orderId is provided, fetch single order
    if (orderId) {
      if (!Types.ObjectId.isValid(orderId)) {
        return new Response(JSON.stringify({ error: 'Invalid order ID' }), { status: 400 });
      }

      const order = await Order.findById(orderId)
        .populate('driverAssignedID', 'firstName lastName')
        .populate('salesmanID', 'firstName lastName');

      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
      }

      const formattedOrder = {
        ...order.toObject(),
        driver: order.driverAssignedID,
        salesman: order.salesmanID,
      };

      return new Response(JSON.stringify({ order: formattedOrder }), { status: 200 });
    }

    let orders;

    if (salesmanID) {
      orders = await Order.find({ salesmanID: new Types.ObjectId(salesmanID) })
        .sort({ createdAt: -1 })
        .populate('driverAssignedID', 'firstName lastName')
        .populate('salesmanID', 'firstName lastName');
    } else if (userRole === 'salesman') {
      orders = await Order.find({ salesmanID: new Types.ObjectId(session.user.id) })
        .sort({ createdAt: -1 })
        .populate('driverAssignedID', 'firstName lastName')
        .populate('salesmanID', 'firstName lastName');
    } else {
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('driverAssignedID', 'firstName lastName')
        .populate('salesmanID', 'firstName lastName');
    }

    const formattedOrders = orders.map((order) => ({
      ...order.toObject(),
      driver: order.driverAssignedID,
      salesman: order.salesmanID,
    }));

    return new Response(JSON.stringify(formattedOrders), { status: 200 });
  } catch (err) {
    console.error('Order fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders.' }), {
      status: 500,
    });
  }
}


// --- PUT: Update an order ---
export async function PUT(req) {
  try {
    const body = await req.json();
    await connectToDatabase();

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { orderId, ...updateData } = body;

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400 });
    }

    if (updateData.orderNumber) {
      delete updateData.orderNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, order: updatedOrder }), {
      status: 200,
    });

  } catch (err) {
    console.error('Order update error:', err);
    return new Response(JSON.stringify({ error: 'Failed to update order.' }), {
      status: 500,
    });
  }
}

// --- DELETE: Delete an order ---
export async function DELETE(req) {
  try {
    await connectToDatabase();

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400 });
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Order deleted successfully' }), {
      status: 200,
    });

  } catch (err) {
    console.error('Order deletion error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete order.' }), {
      status: 500,
    });
  }
}
