import  mongoose from 'mongoose'

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('Database Connected')
    });

    mongoose.connection.on('error', (err) => {
        console.error('Database connection error:', err);
    });

    await mongoose.connect(`${process.env.MONGO_URI}/lms`);
}

export default connectDB;