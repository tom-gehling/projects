import bcrypt from "bcryptjs";
import crypto from "crypto";
import express from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import passport from "passport";
import { z } from "zod";
import { CustomError } from "../types/common";
import { DbRequest } from "../types/types";
import { getCustomError } from "../utils/error";
import { deepMerge } from "../utils/utils";

const router = express.Router();

// login
router.post("/login", passport.authenticate("local"), (req, res) => {
	res.json({ success: true, error: null }).end();
});

// logout
router.get("/logout", (req: any, res) => {
	req.logout();
	res.json({ success: true, error: null }).end();
});

// signup
router.post("/create", async (req: DbRequest, res, next) => {
	const schema = z.object({
		email: z.string().email(),
		first_name: z.string(),
		last_name: z.string(),
		password: z.string().min(6),
		picture_url: z.string().optional(),
	});

	const input = schema.safeParse(req.body);
	if (!input.success) return next(new Error("Invalid Account Input!"));

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	let [rows] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE email = ?", [input.data.email]);

	if (rows.length) return res.json({ success: false, error: "User already exists" }).end();

	const user_id = crypto.randomUUID();
	const hashedPassword = bcrypt.hashSync(input.data.password, 10);

	await database.query<OkPacket>("INSERT INTO User (user_id, email, first_name, last_name, password, picture_url) VALUES (?, ?, ?, ?, ?, ?)", [
		user_id,
		input.data.email,
		input.data.first_name,
		input.data.last_name,
		hashedPassword,
		input.data.picture_url,
	]);

	const user: Express.User = {
		user_id,
		email: input.data.email,
		password: hashedPassword,
	};

	// then return the user row
	const [return_user] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ?", [user_id]);

	req.login(user, function (err) {
		if (err) return next(err);
		return res.json({ success: true, error: null, data: { user: return_user }, ID: user_id }).end();
	});
});

// get data
router.get("/data", async (req: DbRequest, res, next) => {
	// we are going to fetch user_id from either the session data or request body
	let user_id: string | undefined | null = null;

	const schema = z.object({
		user_id: z.string(),
	});

	const input = schema.safeParse(req.body);
	if (!input.success) {
		// fetch from session
		user_id = req.user?.user_id;
	} else {
		user_id = input.data.user_id;
	}

	if (!user_id) return next(new Error("Invalid user ID."));

	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ?", [user_id]);

	if (!rows.length) {
		res.status(200).json({ success: false, error: "User doesn't exist" }).end();
		return;
	}

	// exclude password from the response.
	const userInformation = { ...rows[0], password: undefined };

	res.status(200).json({ success: true, error: null, data: userInformation }).end();
});

// update
router.put("/update", async (req: DbRequest, res, next) => {
	const schema = z.object({
		user_id: z.string(),
		email: z.string().optional(),
		first_name: z.string().optional(),
		last_name: z.string().optional(),
		picture_url: z.string().nullable().optional(),
		notification_settings: z.any().optional(),
		phone_number: z.string().nullable().optional(),
		status: z.union([z.literal(0), z.literal(1)]).optional(),
		birth_date: z.string().nullable().optional(),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(new Error("Invalid user data.\n" + parsed.error.message));
	const input = parsed.data;

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ?", [input.user_id]);

	// If user doesn't exist, send error
	if (!rows.length) {
		const err: CustomError = new Error("User doesn't exist");
		err.status = 403;
		return next(err);
	}

	const user_id = req.user?.user_id;

	if (!user_id) {
		const err: CustomError = new Error("User not logged in");
		err.status = 403;
		return next(err);
	}

	// if the user is not the same user, or if the user is not an admin, send error
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ? AND system_admin = 1", [user_id]);

	if (user_id !== input.user_id && !admin.length) {
		const err: CustomError = new Error("User not authorized");
		err.status = 403;
		return next(err);
	}

	input.birth_date = input.birth_date ? new Date(input.birth_date).toISOString().slice(0, 19).replace('T', ' ') : null;

	await database.query<OkPacket>("UPDATE User SET email = ?, first_name = ?, last_name = ?, picture_url = ?, notification_settings = ?, status = ?, phone_number = ?, birth_date = ? WHERE user_id = ?", [
		input.email ?? rows[0].email,
		input.first_name ?? rows[0].first_name,
		input.last_name ?? rows[0].last_name,
		input.picture_url ?? rows[0].picture_url,
		JSON.stringify(input.notification_settings ?? rows[0].notification_settings),
		input.status ?? rows[0].status,
		input.phone_number ?? rows[0].phone_number,
		input.birth_date ?? rows[0].birth_date,
		input.user_id,
	]);

	res.status(200).json({ success: true, error: null }).end();
});

// timeline
router.get("/timeline", async (req: DbRequest, res, next) => {
	// will return all the user's subscribed posts and events, also the top 10 trending events.
	const user_id = req.user?.user_id;

	if (!user_id) {
		const err: CustomError = new Error("Invalid user ID.");
		err.status = 403;
		return next(err);
	}

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	try {
		// Get clubs the user is part of
		const [userClubs] = await database.query<RowDataPacket[]>("SELECT club_id FROM ClubUser WHERE user_id = ?", [user_id]);

		var posts: RowDataPacket[] = [];
		var events: RowDataPacket[] = [];

		if (userClubs.length) {
			// Get posts and events from the clubs user is part of
			const club_ids = userClubs.map(club => club.club_id);
			const [_posts] = await database.query<RowDataPacket[]>("SELECT * FROM Post WHERE club_id IN (?)", [club_ids]);
			const [_events] = await database.query<RowDataPacket[]>("SELECT * FROM Event WHERE club_id IN (?)", [club_ids]);

			posts = _posts;
			events = _events;
		}




		// Get top 10 trending events
		const [trending] = await database.query<RowDataPacket[]>(`
			SELECT Event.*, COUNT(*) as rsvp_count
			FROM Event JOIN EventUser ON Event.event_id = EventUser.event_id
			WHERE EventUser.rsvp != "none"
			GROUP BY Event.event_id
			ORDER BY rsvp_count DESC
			LIMIT 10
		`);

		const trending_event_ids = trending.map(event => event.event_id);
		const event_ids = [...trending_event_ids, ...events.map(event => event.event_id)];
		let event_users: RowDataPacket[] = [];
		if (event_ids.length > 0) {
			const [_event_users] = await database.query<RowDataPacket[]>(`SELECT * FROM EventUser WHERE event_id IN (?)`, [event_ids]);
			event_users = _event_users;
		}



		res.json({
			success: true,
			error: null,
			data: {
				posts,
				events,
				trending,
				attendance: event_users,
			}
		}).end();
	} catch (error) {
		next(error);
	}
});

router.get("/notifications", async (req: DbRequest, res, next) => {
	const user_id = req.user?.user_id;

	if (!user_id) {
		const err: CustomError = new Error("Invalid user ID.");
		err.status = 403;
		return next(err);
	}

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	try {
		const [notifications] = await database.query<RowDataPacket[]>(`SELECT * FROM Notification WHERE Notification.user_id = ?`, [user_id]);
		res.json({ success: true, error: null, data: { notifications }, }).end();
	} catch (error) {
		next(error);
	}
});

router.get("/emails/settings", async (req: DbRequest, res, next) => {
	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(403, "Invalid user ID."));
	}

	const database = req.db;

	if (!database) {
		return next(getCustomError(503, "Database not found"));
	}

	// this request is going to return the structure of the JSON object that the user's notification settings should be
	// basically, for each club there should be notification settings for:
	// - new posts
	// - new events
	// - upcoming events
	// and for each club the user is an admin of, there should be notification settings for:
	// - new members
	// - members left
	// - new club request
	// and generally, there should be notification settings for:
	// - new invites
	// - kicked from club
	// - club request accepted
	// - club request denied

	// this structure should be generated first, and then do a query to get the user's current notification settings
	// and then merge the two together, so that the user's current notification settings are the default values

	// get all the clubs the user is part of
	const [userClubs] = await database.query<RowDataPacket[]>("SELECT club_id FROM ClubUser WHERE user_id = ?", [user_id]);

	// get all the clubs the user is an admin of
	const [userAdminClubs] = await database.query<RowDataPacket[]>("SELECT club_id FROM ClubUser WHERE user_id = ? AND role = 'admin'", [user_id]);

	// get current notification settings
	const [notificationSettings] = await database.query<RowDataPacket[]>("SELECT notification_settings FROM User WHERE user_id = ?", [user_id]);

	// generate the default notification settings
	const defaultSettings = {
		clubs: {
			// for each club the user is part of
			...userClubs.reduce((acc, club) => {
				acc[club.club_id] = {
					// new posts
					new_posts: true,
					// new events
					new_events: true,
					// upcoming events
					upcoming_events: true,
				};
				return acc;
			}, {} as { [club_id: number]: { new_posts: boolean, new_events: boolean, upcoming_events: boolean } }),
		},
		// for each club the user is an admin of
		admin: {
			...userAdminClubs.reduce((acc, club) => {
				acc[club.club_id] = {
					// new members
					new_members: true,
					// members left
					members_leave: true,
					// new club request
					member_request: true,
				};
				return acc;
			}, {} as { [club_id: number]: { new_members: boolean, members_leave: boolean, member_request: boolean } }),
		},
		// generally
		general: {
			// new invites
			new_invites: true,
			// kicked from club
			club_kicked: true,
			// club request accepted
			club_request_accepted: true,
			// club request denied
			club_request_denied: true,
		}
	};
	const user_settings = notificationSettings[0]?.notification_settings ?? {};

	// merge the two together
	const mergedSettings = deepMerge(defaultSettings, user_settings);

	res.json({ success: true, error: null, data: { settings: mergedSettings } }).end();
});

// save email settings
router.post("/emails/settings", async (req: DbRequest, res, next) => {
	const schema = z.object({
		settings: z.object({
			clubs: z.record(z.object({
				new_posts: z.boolean(),
				new_events: z.boolean(),
				upcoming_events: z.boolean(),
			})),
			admin: z.record(z.object({
				new_members: z.boolean(),
				members_leave: z.boolean(),
				member_request: z.boolean(),
			})),
			general: z.object({
				new_invites: z.boolean(),
				club_kicked: z.boolean(),
				club_request_accepted: z.boolean(),
				club_request_denied: z.boolean(),
			})
		}),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(new Error("Invalid settings data.\n" + parsed.error.message));
	const input = parsed.data;

	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(403, "Invalid user ID."));
	}

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ?", [user_id]);

	// If user doesn't exist, send error
	if (!rows.length) {
		const err: CustomError = new Error("User doesn't exist");
		err.status = 403;
		return next(err);
	}

	await database.query<OkPacket>("UPDATE User SET notification_settings = ? WHERE user_id = ?", [
		JSON.stringify(input.settings),
		user_id,
	]);

	res.status(200).json({ success: true, error: null }).end();
});


export default router;
