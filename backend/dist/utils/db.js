import mongoose from 'mongoose';
export async function connect() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI not set');
    }
    mongoose.set('strictQuery', true);
    return mongoose.connect(mongoUri);
}
