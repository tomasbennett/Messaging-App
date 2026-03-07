

import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import session from "express-session";
import passport from "passport";


import { router as apiRouter } from "./controllers/api";

import { Server, Socket } from "socket.io";


// import "./passport/passportConfig";
import { environment } from "../../shared/constants";
import { SendMessageSchema } from "../../shared/features/message/models/ISendMessage";
import { IReceiveMessage } from "../../shared/features/message/models/IReceiveMessage";
import { ICustomErrorResponse } from "../../shared/features/api/models/APIErrorResponse";
import { SOCKET_CHAT_RECEIVE_EVENT, SOCKET_CHAT_SEND_EVENT } from "../../shared/features/message/constants";
import { ICustomSuccessMessage } from "../../shared/features/api/models/APISuccessResponse";


const SERVER = path.resolve(process.cwd(), "server");
const CLIENT_DIST = path.resolve(process.cwd(), "client", "dist");



dotenv.config({
  path: path.join(SERVER, ".env"),
});

const app = express();
const server = http.createServer(app);

const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(cors({
  origin: environment === "PROD" ? true : allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(CLIENT_DIST));



app.use(session({
  name: "session-id",
  secret: process.env.COOKIE_SECRET_NAME || "default_secret",
  resave: false,
  saveUninitialized: false,
  proxy: environment === "PROD" ? true : false,
  cookie: {
    httpOnly: true,
    secure: environment === "PROD",
    sameSite: environment === "PROD" ? "none" : "lax",
  },
}));



app.use(passport.initialize());
app.use(passport.session());






app.use("/api", apiRouter);


app.get(/.*/, (req: Request, res: Response, next: NextFunction) => {

  return res.sendFile(path.join(CLIENT_DIST, "index.html"));


});



app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return;
});


const PORT = process.env.PORT || 3000;


const io = new Server(server, {
  cors: {
    origin: environment === "PROD" ? true : allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected: " + socket.id);

  socket.on(SOCKET_CHAT_SEND_EVENT, (data: unknown, ack: (err: ICustomErrorResponse | ICustomSuccessMessage) => void) => {
    const result = SendMessageSchema.safeParse(data);
    if (!result.success) {
      console.error("Invalid message data: ", result.error);
      return ack({
        status: 400,
        message: result.error.issues.map(e => e.message).join(", "),
        ok: false
      });
    }

    const { content, timestamp, senderUsername } = result.data;

    console.log("Received message: " + content + " from sender: " + senderUsername);
    const emitData: IReceiveMessage = {
      content,
      senderUsername,
      timestamp
    };

    socket.broadcast.emit(SOCKET_CHAT_RECEIVE_EVENT, emitData);

    return ack({
      status: 200,
      message: "Message sent successfully" + " from sender: " + senderUsername + " at timestamp: " + timestamp + " with content: " + content,
      ok: true
    });

  });



  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
    
  });




});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});
