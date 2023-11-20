import express from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import { z } from "zod";
import { CustomError } from "../types/common";
import { DbRequest } from "../types/types";
import { getCustomError } from "../utils/error";
import { newEvent } from "../utils/notifications";

const router = express.Router();

router.get("/", async (req: DbRequest, res, next) => {
	const user_id = req.user?.user_id;
	if (!user_id) return next(getCustomError(401, "User not logged in"));

	// fetch all events
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [events] = await database.query<RowDataPacket[]>("SELECT * FROM Event");
	const [attendance] = await database.query<RowDataPacket[]>("SELECT * FROM EventUser");

	res.status(200).json({ success: true, error: null, data: { events, attendance } }).end();
})

router.post("/", async (req: DbRequest, res, next) => {
	const schema = z.object({
		event_ids: z.array(z.string().uuid()),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(getCustomError(404, "Invalid Event IDs"));
	const input = parsed.data;

	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) return next(getCustomError(401, "User not logged in"));

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	// we want to return an object with { events, members } where members includes User information and rsvp status
	const [events] = await database.query<RowDataPacket[]>("SELECT * FROM Event WHERE event_id IN (?)", [input.event_ids]);
	const [members] = await database.query<RowDataPacket[]>(`
		SELECT EventUser.rsvp, EventUser.updated_at, User.user_id, User.email, User.first_name, User.last_name, User.picture_url FROM EventUser
		LEFT JOIN User ON EventUser.user_id = User.user_id
		WHERE event_id IN (?)
	`, [input.event_ids]);

	res.status(200).json({ success: true, error: null, data: { events, members } }).end();
});

// create
router.post("/create", async (req: DbRequest, res, next) => {
	const schema = z.object({
		event_id: z.string().uuid(),
		title: z.string(),
		description: z.string(),
		location: z.object({
			lat: z.number().nullable(),
			lng: z.number().nullable(),
		}),
		start_time: z.string(),
		end_time: z.string(),
		privacy: z.enum(["public", "member", "private"]),
		club_id: z.string().uuid()
	});

	let parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(new Error("Invalid event data.\n" + parsed.error.message));
	const input = parsed.data;

	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) return next(getCustomError(401, "User not logged in"));

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	let [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Event WHERE title = ? OR event_id = ?", [input.title, input.event_id]);

	if (rows.length) {
		return next(getCustomError(403, "Event already exists"));
		return;
	}

	// transform dates
	input.start_time = new Date(input.start_time).toISOString().slice(0, 19).replace('T', ' ');
	input.end_time = new Date(input.end_time).toISOString().slice(0, 19).replace('T', ' ');


	await database.query<OkPacket>("INSERT INTO Event (event_id, title, description, location, start_time, end_time, status, privacy, club_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		[input.event_id, input.title, input.description, JSON.stringify(input.location), input.start_time, input.end_time, 1, input.privacy, input.club_id]);

	// notify users
	await newEvent(database, input.event_id);

	res.status(200).json({ success: true, error: null, ID: input.event_id, refetch_data: true }).end();
});

// update
router.put("/update", async (req: DbRequest, res, next) => {
	const schema = z.object({
		event_id: z.string().uuid(),
		title: z.string().optional(),
		description: z.string().optional(),
		location: z.object({
			lat: z.number().nullable(),
			lng: z.number().nullable()
		}).optional(),
		start_time: z.string().optional(),
		end_time: z.string().optional(),
		status: z.union([z.literal(0), z.literal(1)]).optional(),
		privacy: z.enum(["public", "member", "private"]).optional(),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(new Error("Invalid event data.\n" + parsed.error.message));
	const input = parsed.data;
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Event WHERE event_id = ?", [input.event_id]);

	if (!rows.length) {
		const err: CustomError = new Error("Event doesn't exist");
		err.status = 403;
		return next(err);
	}

	const user_id = req.user?.user_id;

	if (!user_id) return next(getCustomError(401, "User not logged in"));

	// check that the user is an admin of the club that the event is a part of, or that the user is a system_admin
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ? AND system_admin = 1", [user_id]);

	if (!admin.length) {
		const [club_admin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE user_id = ? AND club_id = ? AND role = 'admin", [user_id, rows[0].club_id]);

		if (!club_admin.length) {
			const err: CustomError = new Error("User is not an admin of the club");
			err.status = 403;
			return next(err);
		}
	}

	// transform dates
	if (input.start_time) input.start_time = new Date(input.start_time).toISOString().slice(0, 19).replace('T', ' ');
	if (input.end_time) input.end_time = new Date(input.end_time).toISOString().slice(0, 19).replace('T', ' ');

	await database.query<OkPacket>("UPDATE Event SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?, status = ?, privacy = ? WHERE event_id = ?",
		[input.title ?? rows[0].title,
		input.description ?? rows[0].description,
		JSON.stringify(input.location ?? rows[0].location),
		input.start_time ?? rows[0].start_time,
		input.end_time ?? rows[0].end_time,
		input.status ?? rows[0].status,
		input.privacy ?? rows[0].privacy,
		input.event_id]);

	res.status(200).json({ success: true, error: null }).end();
});

// data
router.get("/data", async (req: DbRequest, res, next) => {
	const schema = z.object({
		event_id: z.string().uuid(),
	});

	const input = schema.parse(req.query);
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Event WHERE event_id = ?", [input.event_id]);

	if (!rows.length) {
		const err: CustomError = new Error("Event doesn't exist");
		err.status = 404;
		return next(err);
	}

	const event = rows[0];

	res.status(200).json({ success: true, error: null, data: event }).end();
});

// attendance upsert
router.put("/attendance", async (req: DbRequest, res, next) => {
	const schema = z.object({
		event_id: z.string().uuid(),
		rsvp: z.enum(["none", "interested", "going"]),
	});

	let parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(new Error("Invalid event attendance data.\n" + parsed.error.message));
	const input = parsed.data;

	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) return next(getCustomError(401, "User not logged in"));

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	// check if the event exists
	const [eventRows] = await database.query<RowDataPacket[]>("SELECT * FROM Event WHERE event_id = ?", [input.event_id]);
	if (!eventRows.length) {
		const err: CustomError = new Error("Event not found");
		err.status = 404;
		return next(err);
	}

	// upsert user's event attendance
	await database.query<OkPacket>("INSERT INTO EventUser (event_id, user_id, rsvp) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rsvp = ?", [input.event_id, user_id, input.rsvp, input.rsvp]);

	res.status(200).json({ success: true, error: null }).end();
});

export default router;
