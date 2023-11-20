// import and setup environment
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
dotenv.config();

// import routes
import clubRouter from "./routes/clubs/club-router";
import eventRouter from "./routes/event-router";
import postRouter from "./routes/post-router";
import testRouter from "./routes/test-router";
import userRouter from "./routes/user-router";

// import middleware
import { errorHandler } from "./middleware/error";

// initialises passport for auth & session management
import passport from "./utils/passport-setup";

// import utils & types
import { authMiddleware } from "./middleware/auth";
import { DbRequest } from "./types/types";
import { getConnection, updateConnectionCount } from "./utils/db-connection";
import { checkUpcomingEvents } from "./utils/notifications";

const app = express();

const MySQLStore = require("express-mysql-session")(session);


// middleware
app.use(
	cors({
		origin: "http://127.0.0.1:5173", /** @todo in production, replace with actual URL of app */
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// authentication & session handling
const options = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	createDatabaseTable: true,
};

// @ts-ignore
let sessionStore = new MySQLStore(options);

app.use(
	session({
		name: "session_cookie_name",
		secret: "session_cookie_secret",
		store: sessionStore,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: "auto", // Ensure secure cookies in production, non-secure in development
			maxAge: 24 * 60 * 60 * 1000, // Cookie valid for 1 day
		},
	})
);

// initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// add access to a database connection on each request.
app.use(async (req: DbRequest, res, next) => {
	if (!req.query.kill_db) {
		const connection = await getConnection();
		req.db = connection;
		res.on("finish", async () => {
			await connection.end();
			updateConnectionCount(-1);
		});
	}
	next();
});

// middleware to display the HTTP method, the route, and the current SQL connections
app.use((req, res, next) => {
	const method = req.method;
	const url = req.originalUrl;

	console.log(`${method} ${url}`);
	next();
});

app.get('/auth/github',
	authMiddleware, // Replace with your middleware to ensure that the user is logged in
	passport.authenticate('github'));

app.get('/auth/github/callback',
	passport.authenticate('github', { failureRedirect: 'http://127.0.0.1:5173/login' }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect('http://127.0.0.1:5173/');
	});


// routes
app.use("/api/test", testRouter);
app.use("/api/user", userRouter);
app.use("/api/club", clubRouter);
app.use("/api/event", eventRouter);
app.use("/api/post", postRouter);

import indexRouter from "./routes/index-router";
app.use("/api", indexRouter);


// error handler
app.use(errorHandler);

// add a repeated task every 5 minutes that checks for events that are within a day of NOW and the user hasn't been notified for,
// and notify the user
setInterval(checkUpcomingEvents, 5 * 60 * 1000);
// also run on initial launch
checkUpcomingEvents();



export { app };
