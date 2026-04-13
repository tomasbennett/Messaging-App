

import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

import { apiRouter as apiRouter } from "./controllers/routes";

import { Server, Socket } from "socket.io";


// import "./passport/passportConfig";
import { environment } from "../../shared/constants";
import { APIErrorSchema, ICustomErrorResponse } from "../../shared/features/api/models/APIErrorResponse";
import { SOCKET_CHAT_RECEIVE_EVENT, SOCKET_CHAT_SEND_EVENT } from "../../shared/features/message/constants";
import { ICustomSuccessMessage } from "../../shared/features/api/models/APISuccessResponse";

const ROOT_DIR = environment === "PROD" ? process.cwd() : path.resolve(process.cwd(), "..");
const SERVER = path.resolve(ROOT_DIR, "server");
// const CLIENT_DIST = path.resolve(ROOT_DIR, "client", "dist");



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
// app.use(express.static(CLIENT_DIST));
app.use(cookieParser());


// app.use(session({
//   name: "session-id",
//   secret: process.env.COOKIE_SECRET_NAME || "default_secret",
//   resave: false,
//   saveUninitialized: false,
//   proxy: environment === "PROD" ? true : false,
//   cookie: {
//     httpOnly: true,
//     secure: environment === "PROD",
//     sameSite: environment === "PROD" ? "none" : "lax",
//   },
// }));



// app.use(passport.initialize());
// app.use(passport.session());






app.use("/api", apiRouter);


// app.get(/.*/, (req: Request, res: Response, next: NextFunction) => {
//   return res.sendFile(path.join(CLIENT_DIST, "index.html"));

// });


app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    console.error("Unexpected error: ", err);
    return res.status(500).json({
      status: 500,
      message: err.message || "An unexpected error occurred",
      ok: false
    } as ICustomErrorResponse);
  }

  const customApiErrorResult = APIErrorSchema.safeParse(err);
  if (customApiErrorResult.success) {
    return res.status(customApiErrorResult.data.status).json(customApiErrorResult.data);
  }

  return res.status(500).json({
    status: 500,
    message: "An unexpected error occurred",
    ok: false
  } as ICustomErrorResponse);

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

  // socket.on(SOCKET_CHAT_SEND_EVENT, (data: unknown, ack: (err: ICustomErrorResponse | ICustomSuccessMessage) => void) => {
  //   const result = SendMessageFrontendSchema.safeParse(data);
  //   if (!result.success) {
  //     console.error("Invalid message data: ", result.error);
  //     return ack({
  //       status: 400,
  //       message: result.error.issues.map(e => e.message).join(", "),
  //       ok: false
  //     });
  //   }

  //   const { content } = result.data;

  //   console.log("Received message: " + content);
  //   const emitData: IReceiveMessage = {
  //     content,
  //     timestamp: new Date(),
  //   };

  //   io.emit(SOCKET_CHAT_RECEIVE_EVENT, emitData);

  //   return ack({
  //     status: 200,
  //     message: "Message sent successfully" + " with content: " + content,
  //     ok: true
  //   });

  // });



  // socket.on("disconnect", () => {
  //   console.log("A user disconnected: " + socket.id);

  // });




});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
