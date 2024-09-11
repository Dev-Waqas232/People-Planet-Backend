import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import userRoutes from './routes/user';
import postRoutes from './routes/post';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log(`Server is running on ${PORT}`);
    })
    .catch((err) => console.log(err));
});
