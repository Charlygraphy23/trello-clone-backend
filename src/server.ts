import cookieParser from "cookie-parser";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { connectToDB, errorHandler } from './config';
import Routes from './routers/index';

const app = express();

// middleware
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
app.use(express.json());
app.use(cookieParser());
app.use(Routes);

connectToDB();

// error handler
app.use(errorHandler);

app.listen(3300, () => console.log('Listening'));
