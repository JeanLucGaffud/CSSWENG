import connectToDatabase from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  await connectToDatabase();

  res.status(200).json({ message: 'DB connected and ready!' });

  // mongoose queries here
}