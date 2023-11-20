import express from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import { z } from "zod";
import { CustomError } from "../../types/common";
import { DbRequest } from "../../types/types";
import { getCustomError, getDatabaseError } from "../../utils/error";

const router = express.Router();


// create
router.post("/create", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string().uuid(),
		name: z.string(),
		description: z.string(),
		private: z.union([z.literal(0), z.literal(1)]),
	});

	const input = schema.parse(req.body);
	const database = req.db;

	if (!database) {
		return next(getDatabaseError());
	}
	// make sure that the user is logged in & store the user's id
	const user_id = req.user?.user_id;
	if (!user_id) return next(getCustomError(401, "User not logged in"));


	let [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE (name = ? OR club_id = ?) AND status <> 0", [input.name, input.club_id]);

	if (rows.length) {
		res.status(200).json({ success: false, error: "Club already exists" }).end();
		return;
	}

	await database.query<OkPacket>("INSERT INTO Club (club_id, name, description, private) VALUES (?, ?, ?, ?)", [input.club_id, input.name, input.description, input.private]);

	// make the user automatically join the club
	await database.query<OkPacket>("INSERT INTO ClubUser (club_id, user_id, role) VALUES (?, ?, 'admin')", [input.club_id, user_id]);
	;
	res.status(200).json({ success: true, error: null, ID: input.club_id }).end();
});

// update
router.put("/update", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
		name: z.string().optional(),
		description: z.string().optional(),
		private: z.union([z.literal(0), z.literal(1)]).optional(),
		status: z.union([z.literal(0), z.literal(1)]).optional(),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) {
		return next(getCustomError(400, "Invalid input"));
	}
	const input = parsed.data;
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE club_id = ?", [input.club_id]);

	if (!rows.length) {
		const err: CustomError = new Error("Club doesn't exist");
		err.status = 403;
		return next(err);
	}

	const user_id = req.user?.user_id;
	if (!user_id) return next(getCustomError(401, "User not logged in"));

	// check that user is either a system admin, or an admin of the club
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ? AND system_admin = 1", [input.club_id, user_id]);
	const [clubAdmin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin'", [input.club_id, user_id]);

	if (!admin.length && !clubAdmin.length) {
		const err: CustomError = new Error("User is not an admin of the club");
		err.status = 403;
		return next(err);
	}

	await database.query<OkPacket>("UPDATE Club SET name = ?, description = ?, private = ?, status = ? WHERE club_id = ?", [
		input.name ?? rows[0].name,
		input.description ?? rows[0].description,
		input.private ?? rows[0].private,
		input.status ?? rows[0].status,
		input.club_id,
	]);

	if (input.status === 0) {
		// also set all club post status to 0 and club events status to 0
		await database.query<OkPacket>("UPDATE Post SET status = 0 WHERE club_id = ?", [input.club_id]);
		await database.query<OkPacket>("UPDATE Event SET status = 0 WHERE club_id = ?", [input.club_id]);
	}

	res.status(200).json({ success: true, error: null }).end();
});

// data
router.post("/data", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
	});

	const input = schema.parse(req.body);
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE club_id = ?", [input.club_id]);

	if (!rows.length) {
		const err: CustomError = new Error("Club doesn't exist");
		err.status = 404;
		return next(err);
	}

	const club = rows[0];
	club.private = !!club.private; // convert `private` to boolean

	// get members from club
	const [members] = await database.query<RowDataPacket[]>(`
		SELECT ClubUser.role, ClubUser.created_at AS joined_at, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url, User.user_id FROM ClubUser
		LEFT JOIN User ON ClubUser.user_id = User.user_id
		WHERE club_id = ?
	`, [input.club_id]);

	// get all public events & posts
	// include count of who's going & interest to each event
	const [events] = await database.query<RowDataPacket[]>(`
		SELECT Event.*,
			(SELECT COUNT(*) FROM EventUser WHERE Event.event_id = EventUser.event_id AND EventUser.rsvp = 'going') AS going,
			(SELECT COUNT(*) FROM EventUser WHERE Event.event_id = EventUser.event_id AND EventUser.rsvp = 'interested') AS interested
		FROM Event
		WHERE Event.club_id = ? AND Event.privacy = 'public' AND Event.status = 1
	`, [input.club_id]);

	const [posts] = await database.query<RowDataPacket[]>(`
		SELECT Post.* FROM Post
		WHERE Post.club_id = ? AND Post.status = 1
	`, [input.club_id]);




	res.status(200).json({ success: true, error: null, data: { club, members, events, posts } }).end();
});

// members
router.post("/members", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
	});

	const input = schema.parse(req.body);
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	// fetch all members of the club and their user information
	const [members] = await database.query<RowDataPacket[]>(`
		SELECT ClubUser.role, ClubUser.created_at AS joined_at, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url, User.user_id FROM ClubUser
		LEFT JOIN User ON ClubUser.user_id = User.user_id
		WHERE ClubUser.club_id = ?
	`, [input.club_id]);

	// fetch all invites and requests as well
	const [invites] = await database.query<RowDataPacket[]>(`
		SELECT ClubInvite.invite_id, ClubInvite.created_at, ClubInvite.status, ClubInvite.state, ClubInvite.user_id, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url FROM ClubInvite
		LEFT JOIN User ON ClubInvite.user_id = User.user_id
		WHERE ClubInvite.club_id = ? AND ClubInvite.status <> 0
	`, [input.club_id]);

	const [requests] = await database.query<RowDataPacket[]>(`
		SELECT ClubRequest.request_id, ClubRequest.created_at, ClubRequest.status, ClubRequest.state, ClubRequest.user_id, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url FROM ClubRequest
		LEFT JOIN User ON ClubRequest.user_id = User.user_id
		WHERE ClubRequest.club_id = ? AND ClubRequest.status <> 0
	`, [input.club_id]);

	// fetch all users as well
	// this is for searching users to invite
	const [users] = await database.query<RowDataPacket[]>("SELECT User.first_name, User.last_name, User.email, User.picture_url, User.user_id FROM User");


	res.status(200).json({ success: true, error: null, data: { members, invites, requests, users } }).end();
});

// events
router.post("/events", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
	});

	const input = schema.parse(req.body);
	const database = req.db;

	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	// fetch all events of the club
	const [events] = await database.query<RowDataPacket[]>(`
		SELECT * FROM Event
		WHERE club_id = ?
	`, [input.club_id]);

	var attendance: RowDataPacket[] = [];

	if (events.length) {
		// fetch all attendance records
		const [attendance_rows] = await database.query<RowDataPacket[]>(`
			SELECT * FROM EventUser
			WHERE event_id IN (?)
		`, [events.map((event) => event.event_id)]);
		attendance = attendance_rows;
	}

	res.status(200).json({ success: true, error: null, data: { events, attendance } }).end();
});


// join
router.post("/join", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
	});

	const input = schema.parse(req.body);
	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(new Error("User not logged in"));
	}

	if (!database) {
		return next(getDatabaseError());
	}

	// Check if club exists
	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE club_id = ?", [input.club_id]);

	const club = rows?.at(0);

	if (!rows.length) {
		return next(getCustomError(404, "Club not found"));
	}

	// Check if user is already a member
	const [membership] = await database.query<RowDataPacket[]>("SELECT ClubUser.*, User.first_name, User.last_name FROM ClubUser LEFT JOIN User ON ClubUser.user_id = User.user_id WHERE ClubUser.club_id = ? AND ClubUser.user_id = ?", [input.club_id, user_id]);

	if (membership.length) {
		return next(new Error("User already a member"));
	}

	const [users] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ?", [user_id]);
	const user = users.at(0);
	if (!user) {
		return next(new Error("Couldn't fetch user information"));
	}

	// Add user to club
	await database.query<OkPacket>("INSERT INTO ClubUser (club_id, user_id) VALUES (?, ?)", [input.club_id, user_id]);

	// notifty admins that new user has joined club
	const [admins] = await database.query<RowDataPacket[]>("SELECT User.user_id  FROM ClubUser LEFT JOIN User ON ClubUser.user_id = User.user_id WHERE ClubUser.club_id = ? AND ClubUser.role = 'admin'", [input.club_id]);

	if (admins.length) {
		const admin_ids = admins.map((admin) => admin.user_id);

		await createNotifications(database, admin_ids, `New member joined ${club?.name}`, `New member ${user?.first_name} ${user?.last_name} has joined ${club?.name}`, NOTIFICATION_TYPE.NEW_CLUB_MEMBER, { club_id: input.club_id, user_id: user_id });
	}

	res.status(200).json({ success: true, error: null }).end();
});

// leave
router.post("/leave", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
	});

	const input = schema.parse(req.body);
	const database = req.db;
	const user_id = req.user?.user_id;

	if (!database) {
		return next(getDatabaseError());
	}

	if (!user_id) {
		return next(new Error("User not logged in"));
	}


	// Check if club exists
	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE club_id = ?", [input.club_id]);

	if (!rows.length) {
		return next(getCustomError(404, "Club not found"));
	}

	// Check if user is a member
	const [membership] = await database.query<RowDataPacket[]>("SELECT ClubUser.*, User.first_name, User.last_name FROM ClubUser LEFT JOIN User ON ClubUser.user_id = User.user_id WHERE ClubUser.club_id = ? AND ClubUser.user_id = ?", [input.club_id, user_id]);

	if (!membership.length) {
		return next(new Error("User not a member"));
	}

	const user = membership.at(0);

	// Remove user from club
	await database.query<OkPacket>("DELETE FROM ClubUser WHERE club_id = ? AND user_id = ?", [input.club_id, user_id]);

	// alert all admins that user has left club
	const [admins] = await database.query<RowDataPacket[]>(`
		SELECT User.user_id FROM ClubUser
		LEFT JOIN User ON ClubUser.user_id = User.user_id
		WHERE ClubUser.club_id = ? AND ClubUser.role = 'admin'
	`, [input.club_id]);

	const club = rows[0];

	if (admins.length) {
		await createNotifications(database, admins.map((admin) => admin.user_id), `Member left ${club.name}`, `User ${user?.first_name} ${user?.last_name} has left ${club.name}`, NOTIFICATION_TYPE.MEMBER_LEFT_CLUB, { club_id: input.club_id, user_id: user_id })
	}

	res.status(200).json({ success: true, error: null }).end();
});

// modify role
router.post("/role", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
		user_id: z.string(),
		role: z.union([z.literal("member"), z.literal("admin")]),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(getCustomError(400, "Invalid input"));
	const input = parsed.data;

	const database = req.db;

	if (!database) {
		return next(getDatabaseError());
	}

	const admin_id = req.user?.user_id;

	if (!admin_id) {
		return next(new Error("User not logged in"));
	}

	// Check if club exists
	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE club_id = ?", [input.club_id]);

	if (!rows.length) {
		return next(getCustomError(404, "Club not found"));

	}

	// Check if admin is an admin of the club
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin'", [input.club_id, admin_id]);

	if (!admin.length) {
		return next(new Error("User not an admin"));
	}

	// Upsert user's role
	await database.query<OkPacket>("INSERT INTO ClubUser (club_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?", [input.club_id, input.user_id, input.role, input.role]);

	res.status(200).json({ success: true, error: null }).end();
});

// kick user
router.post("/kick", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string(),
		user_id: z.string(),
	});

	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return next(getCustomError(400, "Invalid input"));
	const input = parsed.data;

	const database = req.db;

	if (!database) {
		return next(getDatabaseError());
	}

	const admin_id = req.user?.user_id;

	if (!admin_id) {
		return next(new Error("User not logged in"));
	}

	// Check if club exists
	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Club WHERE club_id = ?", [input.club_id]);

	if (!rows.length) {
		return next(getCustomError(404, "Club not found"));

	}

	// Check if admin is an admin of the club
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin'", [input.club_id, admin_id]);
	const [system_admin] = await database.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ? AND system_admin = 1", [admin_id]);

	if (!admin.length && !system_admin.length) {
		return next(new Error("User not an admin"));
	}

	// Remove user from club
	await database.query<OkPacket>("DELETE FROM ClubUser WHERE club_id = ? AND user_id = ?", [input.club_id, input.user_id]);

	// notify user that they got kicked
	const club = rows.at(0);
	await createNotification(database, input.user_id, `You got kicked from ${club?.name}`, "An administrator removed you from this club.", NOTIFICATION_TYPE.KICKED_FROM_CLUB, { club_id: input.club_id });

	res.status(200).json({ success: true, error: null, refetch_data: true }).end();
});

router.post("/club", async (req: DbRequest, res, next) => {

});

import inviteRouter from "./invite-router";
router.use("/invite", inviteRouter);

import requestRouter from "./request-router";
import { NOTIFICATION_TYPE, createNotification, createNotifications } from "../../utils/notifications";
router.use("/request", requestRouter);


export default router;
