declare global {
	var __TEST_STATUS__: string;
}

import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import util from "util";
const readFile = util.promisify(fs.readFile);

global.__TEST_STATUS__ = "pass";

process.env.DB_HOST = "localhost";
process.env.DB_USER = "user";
process.env.DB_PASSWORD = "password";
process.env.DB_NAME = "test_db";
process.env.DB_PORT = "3306";


// the below test setup is to hide the console output unless a test fails, this helps to reduce the noise in the console
afterEach(() => {
	const test_name = expect.getState().currentTestName;
	if (test_name && expect.getState().testPath?.includes(test_name)) {
		if (expect.getState().currentTestResults[0].status === "failed") {
			global.__TEST_STATUS__ = "fail";
		}
	}
});

beforeEach(() => {
	if (global.__TEST_STATUS__ === "pass") {
		// jest.spyOn(console, "log").mockImplementation(() => {});
		// jest.spyOn(console, "error").mockImplementation(() => {});
	}
});

afterEach(() => {
	jest.restoreAllMocks();
	// Reset test status
	global.__TEST_STATUS__ = "pass";
});

// now we set up the database so that each 'npm run test' will create a new database and seed it with the test data
beforeAll(async () => {
	const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
	const db = await mysql.createConnection({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		port: Number(DB_PORT),
	});

	await db.query(`DROP DATABASE IF EXISTS ${DB_NAME};`);
	await db.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;`);
	await db.query(`USE ${DB_NAME};`);

	/** @note in both of these files, they start with 'USE db_name', we want to skip that in test environment as we are calling 'USE ${DB_NAME}' above ^ */

	// read the initial schema file
	const schema_sql = await readFile(path.join(__dirname, "./schema/schema.sql"), "utf-8");
	const schema = schema_sql.split(";").slice(1);

	// insert seed data
	const seed_sql = await readFile(path.join(__dirname, "./schema/test_seed.sql"), "utf-8");
	const seed = seed_sql.split(";").slice(1);

	const commands = [...schema, ...seed].filter((c) => c.trim() != "");

	for (const command of commands) {
		await db.query(command);
	}

	await db.end();
});

afterAll(async () => {
	const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
	const db = await mysql.createConnection({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		port: Number(DB_PORT),
	});

	await db.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
	await db.end();
});
