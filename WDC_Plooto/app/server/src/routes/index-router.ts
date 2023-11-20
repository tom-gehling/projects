import express from "express";
import { getCustomError } from '../utils/error';
import { DbRequest } from '../types/types';
import { CustomError } from "../types/common";
import { RowDataPacket } from "mysql2/promise";

const router = express.Router();

router.get("/admin", async (req: DbRequest, res, next) => {
	const user_id = req.user?.user_id;

	if (!user_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	const database = req.db;
	if (!database) {

		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	// check if user is a system_admin
	const [admin] = await database.query<RowDataPacket[]>(`
		SELECT * FROM User
		WHERE user_id = ? AND system_admin = 1
	`, [user_id]);


	if (admin.length === 0) {
		return next(getCustomError(403, "User is not a system admin"));
	}

	// fetch all the data for everything

	const [clubs] = await database.query<RowDataPacket[]>(`SELECT * FROM Club`);
	const [events] = await database.query<RowDataPacket[]>(`SELECT * FROM Event`);
	const [posts] = await database.query<RowDataPacket[]>(`SELECT * FROM Post`);
	const [users] = await database.query<RowDataPacket[]>(`SELECT * FROM User`);
	const [clubUsers] = await database.query<RowDataPacket[]>(`SELECT * FROM ClubUser`);

	res.json({ success: true, data: { clubs, events, posts, users, clubUsers } });
})

// generic /data endpoint for fetching all data for a user
/** @todo can be optimised */
router.get("/data", async (req: DbRequest, res, next) => {
	const user_id = req.user?.user_id;
	if (!user_id) {
		return next(getCustomError(401, "User not logged in"));
	}

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	try {
		// Fetch user's clubs
		const [userClubs] = await database.query<RowDataPacket[]>(`
			SELECT Club.* FROM Club
			JOIN ClubUser ON Club.club_id = ClubUser.club_id
			WHERE ClubUser.user_id = ? AND Club.status <> 0
		`, [user_id]);

		// Fetch club's events
		const [eventRows] = await database.query<RowDataPacket[]>(`
		SELECT Event.* FROM Event
		LEFT JOIN EventUser ON Event.event_id = EventUser.event_id
		WHERE (EventUser.user_id = ? OR Event.club_id IN (
			SELECT ClubUser.club_id FROM ClubUser WHERE ClubUser.user_id = ?
		))
		`, [user_id, user_id]);

		// Fetch club's posts
		const [postRows] = await database.query<RowDataPacket[]>(`
			SELECT Post.* FROM Post
			WHERE Post.club_id IN (
				SELECT ClubUser.club_id FROM ClubUser WHERE ClubUser.user_id = ?
			)
		`, [user_id]);

		// Fetch user's club associations
		const [clubAssociationRows] = await database.query<RowDataPacket[]>(`
			SELECT ClubUser.* FROM ClubUser
			WHERE ClubUser.user_id = ? OR ClubUser.club_id IN (
				SELECT ClubUser.club_id FROM ClubUser WHERE ClubUser.user_id = ?
			)
		`, [user_id, user_id]);

		// Fetch user's event attendance
		const [eventAttendanceRows] = await database.query<RowDataPacket[]>(`
			SELECT EventUser.* FROM EventUser
			WHERE EventUser.user_id = ?
		`, [user_id]);

		// fetch all clubs
		const [clubRows] = await database.query<RowDataPacket[]>(`SELECT * FROM Club`);

		// fetch notifications for user
		const [notifications] = await database.query<RowDataPacket[]>(`
			SELECT Notification.* FROM Notification
			WHERE Notification.user_id = ?
		`, [user_id]);

		// fetch all club requests by the user
		const [clubRequests] = await database.query<RowDataPacket[]>(`
			SELECT ClubRequest.* FROM ClubRequest
			WHERE ClubRequest.user_id = ?
		`, [user_id]);


		// Prepare response
		const userData = {
			clubs: clubRows,
			events: eventRows,
			posts: postRows,
			club_association: clubAssociationRows,
			event_attendance: eventAttendanceRows,
			notifications,
			club_requests: clubRequests,
		};

		res.status(200).json({ success: true, data: userData }).end();

	} catch (err) {
		next(err);
	}
});


export default router;