import crypto from "crypto";
import request from "supertest";
import { app } from "../src/app";
import { COMP_SCI_CLUB_ID, getTestUser } from "../test-utils/persistant-user";

const agent = request.agent(app);


const TEST_CLUB = {
	club_id: crypto.randomUUID(),
	name: "club name",
	description: "club description",
	private: false,
};

let temp_club_id: string | null = null;

let user_id: string | null = null;
beforeAll(async () => {
	// login as a user
	user_id = await getTestUser(agent);
});

describe("Testing Routes `/api/club/`", () => {
	describe("Test Route `/api/club/create`", () => {
		test("should create a new club", async () => {
			const res = await agent.post("/api/club/create").send(TEST_CLUB);
			temp_club_id = res.body.ID;

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
		});

		test("should fail to create a new club", async () => {
			const res = await agent.post("/api/club/create").send(TEST_CLUB);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("Club already exists");
		});
	});

	describe("Test Route `/api/club/update`", () => {
		test("should update a club", async () => {
			const updatedClub = {
				club_id: temp_club_id,
				name: "club name",
				description: "Updated",
				private: true,
				status: 1,
			};

			const res = await agent.put("/api/club/update").send(updatedClub);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);

			const fetchRes = await agent.post("/api/club/data").send({ club_id: temp_club_id });
			expect(fetchRes.body.data.club.name).toBe("club name");
			expect(fetchRes.body.data.club.description).toBe("Updated");
			expect(fetchRes.body.data.club.private).toBe(true);
			expect(fetchRes.body.data.club.status).toBe(1);
		});

		test("should fail to update a non-existant club", async () => {
			const updatedClub = {
				club_id: "62075805-eb8f-4379-9af3-ab123c600a45",
				name: "fake_club@test.com",
				description: "Fake",
				private: true,
			};
			const res = await agent.put("/api/club/update").send(updatedClub);

			expect(res.statusCode).toEqual(403);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("Club doesn't exist");
		});

		test("should delete a club", async () => {
			const deleteClub = {
				club_id: temp_club_id,
				status: 0,
			};
			const res = await agent.put("/api/club/update").send(deleteClub);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);

			const fetchRes = await request(app).post("/api/club/data").send({ club_id: temp_club_id });
			expect(fetchRes.body.data.club.status).toBe(deleteClub.status);
		});
	});

	describe("Test Route `/api/club/join` & `/api/club/leave`", () => {
		test("should join a club", async () => {
			const res = await agent.post("/api/club/join").send({
				club_id: COMP_SCI_CLUB_ID
			});

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);
		});

		test("should fail to join a club", async () => {
			const joinClub = {
				club_id: "non_existent_club_id",
			};
			const res = await agent.post("/api/club/join").send(joinClub);

			expect(res.statusCode).toEqual(404);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("Club not found");
		});

		test("should leave a club", async () => {
			const leaveClub = {
				club_id: COMP_SCI_CLUB_ID,
			};
			const res = await agent.post("/api/club/leave").send(leaveClub);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);
		});

		test("should fail to leave a club", async () => {
			const leaveClub = {
				club_id: "non_existent_club_id",
			};
			const res = await agent.post("/api/club/leave").send(leaveClub);

			expect(res.statusCode).toEqual(404);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("Club not found");
		});
	});
});

describe("Testing routes `/api/club` without database", () => {
	test("should fail to create a new club without database", async () => {
		const res = await request(app).post("/api/club/create?kill_db=true").send({
			club_id: crypto.randomUUID(),
			name: "Test Club",
			description: "This is a test club",
			private: false,
		});
		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
	test("should fail to update a club without database", async () => {
		const res = await request(app).put("/api/club/update?kill_db=true").send({
			club_id: "fake_club_id",
			name: "Test Club",
			description: "This is a test club",
			private: true,
		});
		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
	test("should fail to join a club without database", async () => {
		const res = await agent.post("/api/club/join?kill_db=true").send({
			club_id: "fake_club_id",
		});
		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});

	test("should fail to leave a club without database", async () => {
		const res = await agent.post("/api/club/leave?kill_db=true").send({
			club_id: "fake_club_id",
		});
		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
});
