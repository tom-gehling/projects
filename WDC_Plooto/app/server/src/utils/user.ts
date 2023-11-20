import { getConnection, updateConnectionCount } from "./db-connection";
import { RowDataPacket } from "mysql2";

// functions for getting user
export async function getUserFromDatabase(email: string) {
	const connection = await getConnection();
	if (!connection) {
		return null;
	}
	const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM User WHERE email = ?", [email]);
	await connection.end();
	updateConnectionCount(-1);
	return rows[0] as { user_id: string; email: string; password: string };
}

export async function getUserFromDatabaseById(user_id: string) {
	const connection = await getConnection();
	if (!connection) {
		return null;
	}
	const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM User WHERE user_id = ?", [user_id]);
	await connection.end();
	updateConnectionCount(-1);
	return rows[0] as Express.User;
}

export async function getUserByGithubIdFromDatabase(github_id: string) {
	const connection = await getConnection();
	if (!connection) {
		return null;
	}
	const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM User WHERE github_id = ?", [github_id]);
	await connection.end();
	updateConnectionCount(-1);
	return rows[0] as Express.User;
}

export async function linkUserToGithub(user_id: string, github_id: string) {
	const connection = await getConnection();
	if (!connection) {
		return null;
	}
	try {
		const [rows] = await connection.query(`
            UPDATE User SET github_id = ? WHERE user_id = ?
        `, [github_id, user_id]);

		// Fetch the updated user from the database
		const [user] = await connection.query<RowDataPacket[]>(`
            SELECT * FROM User WHERE user_id = ?
        `, [user_id]);

		return user[0] as Express.User;

	} catch (error) {
		console.error(error);
		throw new Error('Could not link GitHub account');
	}
}

