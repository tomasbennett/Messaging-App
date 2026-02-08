

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import session from "express-session";
import passport from "passport";


import { router as apiRouter } from "./controllers/api";



import "./passport/passportConfig";
import { environment } from "../../shared/constants";


const SERVER = path.resolve(process.cwd(), "server");
const CLIENT_DIST = path.resolve(process.cwd(), "client", "dist");



dotenv.config({
  path: path.join(SERVER, ".env"),
});

const app = express();

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});
