import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import { apiRouter as apiRouter } from "./controllers/routes";

import { Server, Socket } from "socket.io";


// import "./passport/passportConfig";
import { environment } from "../../shared/constants";
import { APIErrorSchema, ICustomErrorResponse } from "../../shared/features/api/models/APIErrorResponse";
import { CheckAccessTokenPayload } from "./auth/CheckAccessTokenPayload";
import { User } from "@prisma/client";
import { connectedUsers } from "./sockets/UserSocketMapping";

// const ROOT_DIR = environment === "PROD" ? process.cwd() : path.resolve(process.cwd(), "..");
// const SERVER = path.resolve(ROOT_DIR, "server");
// const CLIENT_DIST = path.resolve(ROOT_DIR, "client", "dist");

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
  console.error("Unexpected error: ", err);
  if (err instanceof Error) {
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


export const io = new Server(server, {
  cors: {
    origin: environment === "PROD" ? true : allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});


io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  console.log("Socket authentication attempt with token: ", token);

  const checkResult = await CheckAccessTokenPayload(token);

  if (!checkResult.ok) {
    console.error("Socket authentication failed: ", checkResult.message);
    return next(new Error(checkResult.message));
  }

  socket.data.user = checkResult.user;

  next();
});



io.on("connection", (socket: Socket) => {
  console.log("A user connected: " + socket.id);
  const user: User = socket.data.user;

  const socketSet = connectedUsers.get(user.id);
  if (socketSet) {
    socketSet.add(socket.id);
  } else {
    connectedUsers.set(user.id, new Set([socket.id]));
  }


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

  // socket.on(SOCKET_MESSAGE_SEND_EVENT, async (data: unknown, ack: (err: ICustomErrorResponse | ICustomSuccessMessage) => void) => {
  //   console.log("Received message send event with data: ", data);

  //   const messageResult = MessageSendSocketSchema.safeParse(data);
  //   if (!messageResult.success) {
  //     const errorDetails = messageResult.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");

  //     console.error("Invalid message data: ", errorDetails);
  //     return ack({
  //       status: 400,
  //       message: errorDetails,
  //       ok: false
  //     });
  //   }

  //   const messageContent = messageResult.data;

  //   const userResult = await CheckAccessTokenPayload(messageContent.accessToken);

  //   if (!userResult.ok) {
  //     console.error("Authentication failed for message send: ", userResult.message);
  //     return ack({
  //       status: userResult.status,
  //       message: userResult.message,
  //       ok: false
  //     });
  //   }

  //   const user = userResult.user;

  //   const conversationParticipant = await prisma.conversationParticipant.findUnique({
  //     where: {
  //       conversationId_userId: {
  //         conversationId: messageContent.conversationId,
  //         userId: user.id,
  //       },
  //       hasLeft: false
  //     }
  //   });

  //   if (!conversationParticipant) {
  //     console.error("Failed to upload message to database for user: ", user.id);
  //     return ack({
  //       ok: false,
  //       status: 403,
  //       message: "Failed to upload message to database"
  //     });
  //   }

  //   const timestamp = new Date();


  //   //NOTE THAT FILES BEING UPLOADED TAKES A DIFFERENT PROCESS THAN THIS, THIS IS JUST FOR THE MESSAGE CONTENT, THE FILES GET UPLOADED FIRST AND THEN THEIR IDS GET SENT IN THIS MESSAGE SEND EVENT TO BE LINKED TO THE MESSAGE IN THE DATABASE
  //   const uploadedMessage = await prisma.message.create({
  //     data: {
  //       // conversationId: messageContent.conversationId,
  //       // senderId: user.id,
  //       // content: messageContent.content,
  //     },
  //     select: {
  //       id: true,
  //       files: {
  //         select: {
  //           id: true,
  //           supabaseFileId: true,
  //         }
  //       }
  //     }
  //   });

  //   const receiveMessageData: IReceiveMessageFrontend = {
  //     messageId: uploadedMessage.id,
  //     conversationId: messageContent.conversationId,
  //     timestamp,
  //     content: messageContent.content,
  //     files: uploadedMessage.files.map(f => ({
  //       fileId: f.id,
  //       fileUrl: f.supabaseFileId,
  //     })),
  //     sender: {
  //       userId: user.id,
  //       username: user.username,
  //     }
  //   }

  //   io.to(`${SOCKET_CONVERSATION_ROOM_PREFIX}:${messageContent.conversationId}`).emit(SOCKET_MESSAGE_RECEIVE_EVENT, receiveMessageData);

  //   return ack({
  //     status: 200,
  //     message: "Message sent successfully",
  //     ok: true
  //   });

  // });




  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);

    const socketIds = connectedUsers.get(user.id);
    socketIds?.delete(socket.id);

    if (socketIds && socketIds.size === 0) {
      connectedUsers.delete(user.id);
      return;
    }

    return;

  });




});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
