import request from "supertest";
import { app } from "../src/app";
import crypto from "crypto";
import { COMP_SCI_CLUB_ID, getTestUser } from "../test-utils/persistant-user";

const agent = request.agent(app);

const TEST_POST = {
	post_id: crypto.randomUUID(),
	title: "Test post",
	content: "This is a test post.",
	club_id: COMP_SCI_CLUB_ID,
	event_id: null,
};

// will store the id of the post created in the first test
let post_id: string | null = null;

let user_id: string | null = null;
beforeAll(async () => {
	// login as a user
	user_id = await getTestUser(agent);
});

describe("Testing Routes `/api/post/`", () => {
	describe("Test Route `/api/post/create`", () => {
		test("should create a new post", async () => {
			const res = await agent.post("/api/post/create").send(TEST_POST);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
		});

		test("should fail to create a new post", async () => {
			const res = await agent.post("/api/post/create").send(TEST_POST);

			expect(res.statusCode).toEqual(403);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("Post already exists");
		});
	});

	describe("Test Route `/api/post/update`", () => {
		test("should update a post", async () => {
			const updatedPost = {
				post_id: TEST_POST.post_id,
				title: "Updated post",
				content: "This is an updated test post.",
				status: 1,
			};
			const res = await agent.put("/api/post/update").send(updatedPost);

			expect(res.statusCode).toEqual(200);
			expect(res.body.success).toBe(true);
			expect(res.body.error).toBe(null);
		});

		test("should fail to update a post", async () => {
			const updatedPost = {
				post_id: crypto.randomUUID(),
				title: "Updated post",
				content: "This is an updated test post.",
				status: 1,
			};
			const res = await agent.put("/api/post/update").send(updatedPost);

			expect(res.statusCode).toEqual(404);
			expect(res.body.success).toBe(false);
			expect(res.body.error).toBe("Post doesn't exist");
		});
	});
});
