import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all drivers
    const drivers = await User.find({ role: 'driver' });

    // Get order counts per driver
    const orders = await Order.aggregate([
      { $match: { driverAssignedID: { $ne: null } } },
      { $group: { _id: "$driverAssignedID", count: { $sum: 1 } } }
    ]);

    const orderMap = {};
    orders.forEach(o => {
      orderMap[o._id.toString()] = o.count;
    });

    const driverData = drivers.map(driver => ({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      orderCount: orderMap[driver._id.toString()] || 0,
    }));

    // Sort by order count ascending
    driverData.sort((a, b) => a.orderCount - b.orderCount);

    return new Response(JSON.stringify(driverData), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch drivers" }), { status: 500 });
  }
}
