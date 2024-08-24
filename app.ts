import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/user';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log(`Server is running on ${PORT}`);
    })
    .catch((err) => console.log(err));
});
