import { Connection, RowDataPacket } from "mysql2/promise";
import { getConnection, updateConnectionCount } from "./db-connection";
import { getMailer } from "./mailer";
import { get } from "http";

export enum NOTIFICATION_TYPE {
	NEW_EVENT = 'new_events', // new events by clubs your following (done)
	UPCOMING_EVENT = 'upcoming_events', // event your attending on the day (done)
	NEW_POST = 'new_posts', // new post by clubs your following (done)
	NEW_CLUB_INVITE = 'new_invites', // for when you get invited to a club (done)
	CLUB_REQUEST_ACCEPTED = 'club_request_accepted', // when your request gets accepted into private club
	CLUB_REQUEST_REJECTED = 'club_request_denied', // when your request gets rejected into private club
	NEW_CLUB_REQUEST = 'member_request', // when someone requests to join your private club
	NEW_CLUB_MEMBER = 'new_members', // when someone joins your club (done)
	MEMBER_LEFT_CLUB = 'members_leave', // when someone leaves your club (done)
	KICKED_FROM_CLUB = 'club_kicked', // when you get kicked from club (done)
}

const EMAIL_FROM = `"Plooto 🌏" <noreply@plooto.dev>`

/**
 * Sends a notification to a single user, use {@link createNotifications} to send to multiple users
 */
export const createNotification = async (database: Connection, user_id: string, title: string, description: string, type: NOTIFICATION_TYPE, metadata: any) => {
	console.log(`NOTIFY => ${type} => ${title} (${user_id})`);

	if (await hasNotificationEnabled(database, user_id, type, metadata?.club_id)) {
		// get the emails from the user_ids
		const [emails] = (await database.query<RowDataPacket[]>(`
			SELECT email
			FROM User
			WHERE user_id = ?
		`, [user_id]));
		// here we call an async function without await, so it doesn't block request
		sendEmails(emails.map(row => row.email), getEmailFromNotification(title, description, metadata, type));

	} else {
		console.log(`User ${user_id} has email notifications disabled for ${type}`);
	}

	try {
		await database.query(`
			INSERT INTO Notification (user_id, title, description, type, metadata)
			VALUES (?, ?, ?, ?, ?)
		`, [user_id, title, description, type, JSON.stringify(metadata)]);
		return true;
	} catch (error) {
		return false;
	}
}

export const createNotifications = async (database: Connection, user_ids: string[], title: string, description: string, type: NOTIFICATION_TYPE, metadata: any) => {
	console.log(`NOTIFY => ${type} => ${title} (${user_ids.length} users)`);


	const filtered_user_ids = (await Promise.all(user_ids.map(async uid => {
		if (await hasNotificationEnabled(database, uid, type, metadata?.club_id)) {
			return uid;
		} else {
			console.log(`User ${uid} has email notifications disabled for ${type}`);
			return null;
		}
	}))).filter((id) => id != null);
	// use filtered user ids for sending emails and send here
	if (filtered_user_ids.length) {
		// get the emails from the user_ids
		const [emails] = (await database.query<RowDataPacket[]>(`
			SELECT email
			FROM User
			WHERE user_id IN (?)
		`, [filtered_user_ids]));
		// here we call an async function without await, so it doesn't block request
		sendEmails(emails.map(row => row.email), getEmailFromNotification(title, description, metadata, type));
	}


	try {
		const rows = user_ids.map(uid => [uid, title, description, type, JSON.stringify(metadata)]);
		await database.query(`
			INSERT INTO Notification (user_id, title, description, type, metadata)
			VALUES ?
		`, [rows]);
		return true;
	} catch (error) {
		return false;
	}
}

const getEmailFromNotification = (title: string, description: string, metadata: any, type: NOTIFICATION_TYPE) => {
	return {
		subject: title,
		text: description
	}
	// add specific handling per-notification
}

const sendEmails = async (emails: string[], body: ReturnType<typeof getEmailFromNotification>) => {
	// get the emails from the user_ids
	const joined_emails = emails.join(', ');
	console.log("sending to ", joined_emails);
	// send the email
	let info = await (await getMailer()).sendMail({
		from: EMAIL_FROM, // sender address
		to: joined_emails, // list of receivers
		...body
	});
	console.log("EMAIL => %s", info.messageId);
}

export const newPost = async (database: Connection, post_id: string) => {
	// fetch the post
	const [post] = await database.query<RowDataPacket[]>(`SELECT * FROM Post WHERE post_id = ?`, [post_id]);

	// make sure post exists
	if (!post.length) return false;

	// fetch the club
	const [club] = await database.query<RowDataPacket[]>(`SELECT * FROM Club WHERE club_id = ?`, [post[0].club_id]);

	// make sure club exists
	if (!club.length) return false;

	// fetch the club members
	const [clubMembers] = await database.query<RowDataPacket[]>(`SELECT * FROM ClubUser WHERE club_id = ?`, [club[0].club_id]);

	// make sure club members exist
	if (!clubMembers.length) return false;

	// create notifications for each club member
	const user_ids = clubMembers.map(member => member.user_id);
	await createNotifications(database, user_ids, `${post[0].title}`, `A new post was created in ${club[0].name}`, NOTIFICATION_TYPE.NEW_POST, { post_id });

	return true;
}

export const newEvent = async (databse: Connection, event_id: string) => {
	// fetch the event
	const [event] = await databse.query<RowDataPacket[]>(`SELECT * FROM Event WHERE event_id = ?`, [event_id]);

	// make sure event exists
	if (!event.length) return false;

	// fetch the club
	const [club] = await databse.query<RowDataPacket[]>(`SELECT * FROM Club WHERE club_id = ?`, [event[0].club_id]);

	// make sure club exists
	if (!club.length) return false;

	// fetch the club members
	const [clubMembers] = await databse.query<RowDataPacket[]>(`SELECT * FROM ClubUser WHERE club_id = ?`, [club[0].club_id]);

	// make sure club members exist
	if (!clubMembers.length) return false;

	// create notifications for each club member
	const user_ids = clubMembers.map(member => member.user_id);
	await createNotifications(databse, user_ids, `${event[0].title}`, `A new event was created in ${club[0].name}`, NOTIFICATION_TYPE.NEW_EVENT, { event_id });

	return true;
}


export const checkUpcomingEvents = async () => {
	const database = await getConnection();
	const [rows] = await database.query<RowDataPacket[]>(`
		SELECT
			eu.user_id,
			e.event_id,
			e.title AS event_name,
			e.start_time,
			e.end_time
		FROM
			EventUser AS eu
		JOIN
			Event AS e ON eu.event_id = e.event_id
		WHERE
			eu.notified_status = 0
			AND
			e.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR);
	`);

	console.log(`Checking for upcoming events... (${rows.length} events)`);

	for (const row of rows) {
		const { user_id, event_id, event_name, start_time, end_time } = row;

		// create notification
		await createNotification(database, user_id, `Upcoming Event: ${event_name} `, `You have an upcoming event in 24 hours`, NOTIFICATION_TYPE.UPCOMING_EVENT, { event_id, start_time, end_time });

		// update notified status
		await database.query(`
			UPDATE EventUser
			SET notified_status = 1
			WHERE user_id = ? AND event_id = ?
		`, [user_id, event_id]);
	}

	await database.end();
	updateConnectionCount(-1);
}

export const hasNotificationEnabled = async (database: Connection, user_id: string, type: NOTIFICATION_TYPE, club_id: string | null) => {
	// fetch user's notification settings
	const [rows] = await database.query<RowDataPacket[]>(`
		SELECT notification_settings FROM User WHERE user_id = ?
	`, [user_id]);

	if (!rows.length) {
		throw new Error('User not found');
	}

	const settings = JSON.parse(JSON.stringify(rows[0]?.notification_settings ?? {}));

	// If club_id is provided, check club specific settings
	if (club_id !== null) {
		if (settings.clubs && settings.clubs[club_id] && typeof settings.clubs[club_id][type] === 'boolean') {
			return settings.clubs[club_id][type];
		}

		if (settings.admin && settings.admin[club_id] && typeof settings.admin[club_id][type] === 'boolean') {
			return settings.admin[club_id][type];
		}
	}

	// check general settings
	if (settings.general && typeof settings.general[type] === 'boolean') {
		return settings.general[type];
	}

	// If no specific settings, default to true
	return true;
}