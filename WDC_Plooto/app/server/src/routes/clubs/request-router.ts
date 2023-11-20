import express from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import { z } from "zod";
import { DbRequest } from "../../types/types";
import { getCustomError, getDatabaseError } from "../../utils/error";

const router = express.Router();

// accept request
router.put("/accept", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string().uuid(),
		request_id: z.string().uuid(),
		user_id: z.string().uuid(),
	});

	const input = schema.parse(req.body);
	const database = req.db;
	const admin_id = req.user?.user_id;

	if (!admin_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	if (!database) {
		return next(getDatabaseError());
	}

	// Check if user is an admin of the club
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin'", [input.club_id, admin_id]);

	if (!admin.length) {
		return next(new Error("User not an admin"));
	}

	// check if there is a request
	const [request] = await database.query<RowDataPacket[]>("SELECT * FROM ClubRequest WHERE request_id = ? AND status <> 0", [input.request_id]);

	if (!request.length) {
		return next(new Error("Request not found"));
	}

	// delete the request
	await database.query<OkPacket>("DELETE FROM ClubRequest WHERE request_id = ?", [input.request_id]);

	// Insert the user into the club as a member
	await database.query<OkPacket>("INSERT INTO ClubUser (club_id, user_id, role) VALUES (?, ?, 'member')", [input.club_id, input.user_id]);

	// return the new ClubUser record
	const [associations] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ?", [input.club_id, input.user_id]);

	// fetch all members of the club and their user information
	const [members] = await database.query<RowDataPacket[]>(`
		SELECT ClubUser.role, ClubUser.created_at AS joined_at, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url, User.user_id FROM ClubUser
		LEFT JOIN User ON ClubUser.user_id = User.user_id
		WHERE ClubUser.club_id = ? AND ClubUser.user_id = ?
	`, [input.club_id, input.user_id]);

	res.status(200).json({ success: true, error: null, data: { associations, members } }).end();
});

// deny request
router.put("/deny", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string().uuid(),
		request_id: z.string().uuid(),
		user_id: z.string().uuid(),
	});

	const input = schema.parse(req.body);
	const database = req.db;
	const admin_id = req.user?.user_id;

	if (!admin_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	if (!database) {
		return next(getDatabaseError());
	}

	// Check if user is an admin of the club
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin'", [input.club_id, admin_id]);

	if (!admin.length) {
		return next(new Error("User not an admin"));
	}

	// check if there is a request
	const [request] = await database.query<RowDataPacket[]>("SELECT * FROM ClubRequest WHERE request_id = ? AND status <> 0", [input.request_id]);

	if (!request.length) {
		return next(new Error("Request not found"));
	}

	// Update the request
	await database.query<OkPacket>("UPDATE ClubRequest SET state = 'denied' WHERE request_id = ?", [input.request_id]);

	res.status(200).json({ success: true, error: null }).end();
});

router.post("/join", async (req: DbRequest, res, next) => {
	const schema = z.object({
		club_id: z.string().uuid(),
	});

	const input = schema.parse(req.body);
	const database = req.db;

	if (!database) {
		return next(getDatabaseError());
	}

	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	// check if the user is already a member of the club
	const [member] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ?", [input.club_id, user_id]);

	if (member.length) {
		return next(new Error("User is already a member of the club"));
	}

	// check if the user has already requested to join the club
	const [request] = await database.query<RowDataPacket[]>("SELECT * FROM ClubRequest WHERE club_id = ? AND user_id = ? AND status <> 0", [input.club_id, user_id]);

	if (request.length) {
		return next(new Error("User has already requested to join the club"));
	}

	// create the request
	await database.query<OkPacket>("INSERT INTO ClubRequest (club_id, user_id) VALUES (?, ?)", [input.club_id, user_id]);

	// return the request row
	const [return_request] = await database.query<RowDataPacket[]>("SELECT * FROM ClubRequest WHERE club_id = ? AND user_id = ?", [input.club_id, user_id]);

	res.status(200).json({ success: true, error: null, data: { request: return_request.at(0) } }).end();
});
export default router;
