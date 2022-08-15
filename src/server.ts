import cookieParser from "cookie-parser";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { connectToDB, errorHandler, initializeSocket } from './config';
import Routes from './routers/index';

const app = express();
const { server } = initializeSocket(app)


// middleware
app.use(cors({
    credentials: true,
    origin: "*"
}))

app.use(express.json());
app.use(cookieParser());
app.use(Routes);


app.get("/", (req, res) => res.send("Server Runnning"))

connectToDB();

// error handler
app.use(errorHandler);

server.listen(process.env.PORT || 3300, () => console.log('Listening'));
