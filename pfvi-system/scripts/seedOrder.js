import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb_seed.js';
import Order from '../models/Order.js';
import { Types } from 'mongoose';

const seedSingleOrder = async () => {
    try {
        await connectToDatabase();

    // Order data to seed
    const orderData = {
        _id: new Types.ObjectId("686654c06b69658349f8b3db"),
        salesmanID: new Types.ObjectId("664f71a98a8cbe36f0241f09"),
        customerName: "Maraiah Queen Arceta",
        invoice: "INV-001",
        paymentAmt: 2750,
        paymentMethod: "Cash",
        dateMade: new Date("2025-06-01T10:00:00Z"),
        contactNumber: "09171234567",
        assignmentStatus: "Driver Assigned",
        driverAssignedID: new Types.ObjectId("68512edc869a068762a1bcef"),
        orderStatus: "Being Prepared",
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        salesmanNotes: null,
        driverNotes: null,
        secretaryNotes: "2pc Cheesy Yumburger",
    };

    // Check if order already exists
    const existingOrder = await Order.findOne({ 
        $or: [
            { invoice: orderData.invoice },
            { _id: orderData._id }
        ] 
    });

    if (existingOrder) {
        console.log("Order already exists. Skipping seeding.");
        return;
    }

    // Insert the order
    const newOrder = await Order.create(orderData);
    console.log("Order seeded successfully:", newOrder);

    } catch (err) {
    console.error("Seeding error:", err);
    } finally {
    process.exit();
    }
};

seedSingleOrder();