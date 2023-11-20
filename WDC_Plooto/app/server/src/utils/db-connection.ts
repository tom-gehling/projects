import mysql from "mysql2/promise";

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

export const getConnection = async () => {
	const connection = await mysql.createConnection({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
		port: Number(DB_PORT),
	});

	updateConnectionCount(1);

	return connection;
};


let current_connections = 0;
export const updateConnectionCount = (change: number) => {
	current_connections += change;
}
export const getCurrentConnections = () => {
	return current_connections;
}
