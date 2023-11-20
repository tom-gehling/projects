import express from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import { z } from "zod";
import { DbRequest } from "../../types/types";
import { getCustomError, getDatabaseError } from "../../utils/error";
import { NOTIFICATION_TYPE, createNotification } from "../../utils/notifications";

const router = express.Router();

// create invite
router.post("/", async (req: DbRequest, res, next) => {
	const schema = z.object({
		invite_id: z.string().uuid(),
		club_id: z.string().uuid(),
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

	// make sure invite doesn't already exist
	const [invite] = await database.query<RowDataPacket[]>("SELECT * FROM ClubInvite WHERE invite_id = ?", [input.invite_id]);

	if (invite.length) {
		return next(new Error("Invite already exists"));
	}

	// Insert the invitation
	await database.query<OkPacket>("INSERT INTO ClubInvite (invite_id, admin_id, user_id, club_id) VALUES (?, ?, ?, ?)", [input.invite_id, admin_id, input.user_id, input.club_id]);

	// return invite in same format as get invite in /members
	const [return_invite] = await database.query<RowDataPacket[]>(`
		SELECT ClubInvite.invite_id, ClubInvite.created_at, ClubInvite.status, ClubInvite.state, ClubInvite.user_id, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url FROM ClubInvite
		LEFT JOIN User ON ClubInvite.user_id = User.user_id
		WHERE ClubInvite.invite_id = ?
	`, [input.invite_id]);

	// get the club name
	const [name] = await database.query<RowDataPacket[]>("SELECT name FROM Club WHERE club_id = ?", [input.club_id]);

	// notify user of invite
	await createNotification(database, input.user_id, `Invitation to join ${name[0].name}`, `You have been invited to join a club.`, NOTIFICATION_TYPE.NEW_CLUB_INVITE, { club_id: return_invite[0].club_id, name: name[0].name })

	res.status(200).json({ success: true, error: null, data: { invite: return_invite.at(0) } }).end();
});

// delete invite
router.delete("/", async (req: DbRequest, res, next) => {
	const schema = z.object({
		invite_id: z.string().uuid(),
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

	// Check if invite exists
	const [invite] = await database.query<RowDataPacket[]>("SELECT * FROM ClubInvite WHERE invite_id = ?", [input.invite_id]);

	if (!invite.length) {
		return next(new Error("Invite not found"));
	}

	// Check if user is an admin of the club
	const [admin] = await database.query<RowDataPacket[]>("SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin'", [invite[0].club_id, admin_id]);

	if (!admin.length) {
		return next(new Error("User not an admin"));
	}

	// Delete the invitation (set status to 0)
	await database.query<OkPacket>("UPDATE ClubInvite SET status = 0 WHERE invite_id = ?", [input.invite_id]);

	res.status(200).json({ success: true, error: null }).end();
});


// accept invite
router.put("/accept", async (req: DbRequest, res, next) => {
	const schema = z.object({
		invite_id: z.string().uuid(),
	});

	const input = schema.parse(req.body);
	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	if (!database) {
		return next(getDatabaseError());
	}

	// Update the invitation
	await database.query<OkPacket>("UPDATE ClubInvite SET state = 'accepted' WHERE invite_id = ? AND user_id = ?", [input.invite_id, user_id]);

	// Insert the user into the club as a member
	await database.query<OkPacket>("INSERT INTO ClubUser (club_id, user_id, role) SELECT club_id, user_id, 'member' FROM ClubInvite WHERE invite_id = ?", [input.invite_id]);

	res.status(200).json({ success: true, error: null }).end();
});

// reject invite
router.put("/reject", async (req: DbRequest, res, next) => {
	const schema = z.object({
		invite_id: z.string().uuid(),
	});

	const input = schema.parse(req.body);
	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	if (!database) {
		return next(getDatabaseError());
	}

	// Update the invitation
	await database.query<OkPacket>("UPDATE ClubInvite SET state = 'rejected' WHERE invite_id = ? AND user_id = ?", [input.invite_id, user_id]);

	res.status(200).json({ success: true, error: null }).end();
});

// get invites
router.get("/", async (req: DbRequest, res, next) => {
	const database = req.db;
	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	if (!database) {
		return next(getDatabaseError());
	}

	// Get the invitations
	const [invites] = await database.query<RowDataPacket[]>("SELECT * FROM ClubInvite WHERE user_id = ?", [user_id]);

	res.status(200).json({ success: true, error: null, data: { invites } }).end();
});

export default router;
