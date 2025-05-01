import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { connectDB } from "./DB/ConnectDB.js";

const app = express();


app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is litsening on port number ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed.", err);
  });

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//session Configuration
app.use(
  session({
    secret: process.env.Session_Secret || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
    name: "user",
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      // dbName: process.env.DB_NAME,
      collectionName: "sessions",
      stringify: false,
      autoRemove: "interval",
      autoRemoveInterval: 1,
    }),
  }),
);

// Routes
import authRoutes from './Routes/auth.routes.js';
import productRoutes from './Routes/product.routes.js';
import certificateRoutes from './Routes/certificate.routes.js';
import auditRoutes from './Routes/audit.routes.js';
import trackingRoutes from './Routes/tracking.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tracking', trackingRoutes);

export default app;