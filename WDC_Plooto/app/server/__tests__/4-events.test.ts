import crypto from "crypto";
import request from "supertest";
import { app } from "../src/app";
import { COMP_SCI_CLUB_ID, getTestUser } from "../test-utils/persistant-user";

const agent = request.agent(app);

const TEST_EVENT = {
	event_id: crypto.randomUUID(),
	title: "New Event",
	description: "This is a new event",
	location: { lat: 45.5, lng: -73.5 },
	start_time: new Date("2023-06-01 10:00:00"),
	end_time: new Date("2023-06-01 12:00:00"),
	club_id: COMP_SCI_CLUB_ID,
	privacy: "public",

}

let user_id: string | null = null;
beforeAll(async () => {
	// login as a user
	user_id = await getTestUser(agent);
});

describe("Testing Routes `/api/events/`", () => {
	describe("Test Route `/api/event/create`", () => {
		test("should create a new event", async () => {
			const res = await agent.post("/api/event/create").send(TEST_EVENT);
			expect(res.statusCode).toEqual(200);
		});

		test("should fail to create a new event", async () => {
			const res = await agent.post("/api/event/create").send(TEST_EVENT); // sending an empty object to fail the request
			expect(res.statusCode).toEqual(403);
			expect(res.body.error).toEqual("Event already exists");
		});
	});

	xdescribe("Test Route `/api/event/update`", () => {
		test("should update an event", async () => {
			const res = await request(app)
				.put("/api/event/update/event-id-123") // assuming 'event-id-123' exists
				.send({ title: "Updated Title" });

			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty("ID");
		});

		test("should fail to update a non-existant event", async () => {
			const res = await request(app)
				.put("/api/event/update/non-existing-event-id") // this event id should not exist
				.send({ title: "Updated Title" });

			expect(res.statusCode).toEqual(404);
		});

		test("should delete an event", async () => {
			const res = await request(app).delete("/api/event/update/event-id-123"); // assuming 'event-id-123' exists

			expect(res.statusCode).toEqual(200);
		});
	});

	describe("Test Route `/api/event/attendance`", () => {
		test("should upsert attendance", async () => {
			const res = await agent.put("/api/event/attendance").send({
				event_id: TEST_EVENT.event_id,
				rsvp: "going",
			});

			expect(res.statusCode).toEqual(200);
		});

		test("should fail to upsert attendance", async () => {
			const res = await agent.put("/api/event/attendance").send({
				event_id: crypto.randomUUID(),
				rsvp: "going",
			});

			expect(res.statusCode).toEqual(404);
			expect(res.body.error).toBe("Event not found");
		});
	});
});

describe("Testing Routes `/api/events/` without database", () => {
	test("should fail to create an event without database", async () => {
		const res = await agent.post("/api/event/create?kill_db=true").send(TEST_EVENT);

		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});

	xtest("should fail to update an event without database", async () => {
		const res = await agent
			.put("/api/event/update/event-id-123") // assuming 'event-id-123' exists
			.send({ title: "Updated Title" });

		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});

	test("should fail to upsert attendance without database", async () => {
		const res = await agent.put("/api/event/attendance?kill_db=true").send({
			event_id: TEST_EVENT.event_id,
			rsvp: "going",
		});

		expect(res.statusCode).toEqual(503);
		expect(res.body.error).toBe("Database not found");
	});
});
