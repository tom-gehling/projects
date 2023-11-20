import request from "supertest";
import { app } from "../src/app";

const agent = request.agent(app);

const TEST_USER = {
	email: "john.doe@test.com",
	first_name: "John",
	last_name: "Doe",
	password: "password123",
};

// will store the id of the user created in the first test
let user_id: string | null = null;

describe("Testing Routes `/api/user/`", () => {
	describe("Test Route `/api/user/create`", () => {
		test("should create a new user", async () => {
			const res = await agent.post("/api/user/create").send(TEST_USER);
			user_id = res.body.ID;

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(user_id).toBeTruthy();
		});

		test("should fail to create a new user", async () => {
			const res = await agent.post("/api/user/create").send(TEST_USER);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("User already exists");
		});
	});

	describe("Test Route `/api/user/login`", () => {
		test("should log in a user", async () => {
			const res = await agent.post("/api/user/login").send({
				username: TEST_USER.email,
				password: TEST_USER.password,
			});
			// success
			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
		});
		test("should fail log in", async () => {
			const res = await agent.post("/api/user/login").send({
				username: TEST_USER.email,
				password: "wrong password",
			});
			expect(res.statusCode).toEqual(401);
		});
	});

	describe("Test Route `/api/user/data`", () => {
		test("should return user data", async () => {
			const res = await agent.get("/api/user/data").send({
				user_id: user_id,
			});

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);

			// check body
			expect(res.body.data).toBeTruthy();
			expect(res.body.data.email).toBe(TEST_USER.email);
			expect(res.body.data.first_name).toBe(TEST_USER.first_name);
			expect(res.body.data.last_name).toBe(TEST_USER.last_name);
			expect(res.body.data.status).toBe(1);
		});
		test("should not return user data", async () => {
			const res = await agent.get("/api/user/data").send({
				user_id: "invalid user id",
			});

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("User doesn't exist");
		});
		test("should return user data based on session", async () => {
			const res = await agent.get("/api/user/data").send();

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);

			// check body
			expect(res.body.data).toBeTruthy();
			expect(res.body.data.email).toBe(TEST_USER.email);
			expect(res.body.data.first_name).toBe(TEST_USER.first_name);
			expect(res.body.data.last_name).toBe(TEST_USER.last_name);
			expect(res.body.data.status).toBe(1);
		});
	});

	describe("Test Route `/api/user/update`", () => {
		test("should update a user", async () => {
			const updatedUser = {
				user_id: user_id,
				email: "updated@test.com",
				first_name: "Updated",
				last_name: "User",
				picture_url: "",
				notification_settings: {
					/** @todo notification settings */
				},
				status: 1,
			};
			const res = await agent.put("/api/user/update").send(updatedUser);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);

			const fetchRes = await agent.get("/api/user/data").send({ user_id: user_id });
			expect(fetchRes.body.data.email).toBe(updatedUser.email);
			expect(fetchRes.body.data.first_name).toBe(updatedUser.first_name);
			expect(fetchRes.body.data.last_name).toBe(updatedUser.last_name);
			expect(fetchRes.body.data.picture_url).toBe(updatedUser.picture_url);
			expect(fetchRes.body.data.status).toBe(updatedUser.status);
		});
		test("should delete a user", async () => {
			const deleteUser = {
				user_id: user_id,
				status: 0,
			};
			const res = await agent.put("/api/user/update").send(deleteUser);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);

			const fetchRes = await agent.get("/api/user/data").send({ user_id: user_id });
			expect(fetchRes.body.data.status).toBe(deleteUser.status);
		});
		test("should fail to update a nonexistent user", async () => {
			const updatedUser = {
				user_id: "62075802-eb8b-4379-9af3-ab123c600a45",
				email: "fake_user@test.com",
				first_name: "Fake",
				last_name: "User",
			};
			const res = await agent.put("/api/user/update").send(updatedUser);

			expect(res.statusCode).toEqual(403);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("User doesn't exist");
		});
	});
});

describe("Testing Routes `/api/user/` without database", () => {
	test("should fail to create a new user without database", async () => {
		const res = await agent.post("/api/user/create?kill_db=true").send(TEST_USER);

		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
	test("should fail to log in a user without database", async () => {
		const res = await agent.post("/api/user/login?kill_db=true").send({
			email: TEST_USER.email,
			password: TEST_USER.password,
		});

		expect(res.statusCode).toEqual(400);
	});
	test("should fail to return user data without database", async () => {
		const res = await agent.get("/api/user/data?kill_db=true").send({
			user_id: user_id,
		});

		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
	test("should fail to update a user without database", async () => {
		const updatedUser = {
			user_id: user_id,
			email: "updated@test.com",
			first_name: "Updated",
			last_name: "User",
			picture_url: "https://example.com/updated_picture.jpg",
			notification_settings: {},
			status: 1,
		};
		const res = await agent.put("/api/user/update?kill_db=true").send(updatedUser);

		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
});
