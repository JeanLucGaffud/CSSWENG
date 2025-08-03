import { connectToDatabase } from '@/lib/mongodb';
import { Types } from "mongoose";
import User from '@/models/User';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET: Fetch all users ---
export async function GET(req) {
  try {
    await connectToDatabase();

    // Get session from request
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Only allow admin users to access this endpoint
    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // If userId is provided, fetch single user
    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
      }

      const user = await User.findById(userId).select('-passwordHash');

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      }

      // Map the user data to match the frontend expectations
      const formattedUser = {
        ...user.toObject(),
        dateCreated: user.createdAt,
        accountStatus: user.status?.toLowerCase() || 'active',
        verificationStatus: user.isVerified ? 'verified' : 'unverified',
        email: user.phoneNumber // Using phone as email for now, adjust as needed
      };

      return new Response(JSON.stringify({ user: formattedUser }), { status: 200 });
    }

    // Fetch all users
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

    // Format users to match frontend expectations
    const formattedUsers = users.map((user) => ({
      ...user.toObject(),
      dateCreated: user.createdAt,
      accountStatus: user.status?.toLowerCase() || 'active',
      verificationStatus: user.isVerified ? 'verified' : 'unverified',
      email: user.phoneNumber // Using phone as email for now, adjust as needed
    }));

    return new Response(JSON.stringify(formattedUsers), { status: 200 });
  } catch (err) {
    console.error('User fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch users.' }), {
      status: 500,
    });
  }
}

// --- PUT: Update a user ---
export async function PUT(req) {
  try {
    const body = await req.json();
    await connectToDatabase();

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Only allow admin users to update users
    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403 });
    }

    const { userId, firstName, lastName, role, phoneNumber, accountStatus, verificationStatus } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (accountStatus !== undefined) {
      // Map frontend status to backend status
      updateData.status = accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1);
    }
    if (verificationStatus !== undefined) {
      updateData.isVerified = verificationStatus === 'verified';
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Format the response to match frontend expectations
    const formattedUser = {
      ...updatedUser.toObject(),
      dateCreated: updatedUser.createdAt,
      accountStatus: updatedUser.status?.toLowerCase() || 'active',
      verificationStatus: updatedUser.isVerified ? 'verified' : 'unverified',
      email: updatedUser.phoneNumber
    };

    return new Response(JSON.stringify({ success: true, user: formattedUser }), {
      status: 200,
    });

  } catch (err) {
    console.error('User update error:', err);
    if (err.code === 11000) {
      return new Response(JSON.stringify({ error: 'Phone number already exists' }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to update user.' }), {
      status: 500,
    });
  }
}

// --- DELETE: Delete a user ---
export async function DELETE(req) {
  try {
    await connectToDatabase();

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Only allow admin users to delete users
    if (session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'User deleted successfully' }), {
      status: 200,
    });

  } catch (err) {
    console.error('User deletion error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete user.' }), {
      status: 500,
    });
  }
}
