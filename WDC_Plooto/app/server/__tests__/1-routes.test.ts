import request from "supertest";
import { app } from "../src/app";

let agent = request.agent(app);

describe("Testing Routes `/api/test/`", () => {
	test("should reply with a greeting", async () => {
		const res = await agent.get("/api/test");
		expect(res.status).toEqual(200);
		expect(res.text).toEqual("Hello there!");
	});
	describe("Testing error routes", () => {
		test("should respond with a standard Error", async () => {
			const res = await agent.get("/api/test/error/standard");
			expect(res.status).toEqual(500);
			expect(res.body).toHaveProperty("error", "This is a standard Error");
		});

		test("should respond with a custom Error", async () => {
			const res = await agent.get("/api/test/error/custom");
			expect(res.status).toEqual(403);
			expect(res.body).toHaveProperty("error", "This is a custom Error");
		});
		test("should pass zod validation", async () => {
			const res = await agent.post("/api/test/error/validation").send({
				requiredField: "test field",
			});
			expect(res.status).toEqual(200);
			expect(res.text).toEqual("Validation successful!");
		});
		test("should trigger a Zod validation error", async () => {
			const res = await agent.post("/api/test/error/validation").send({});
			expect(res.status).toEqual(500);
			expect(res.body).toHaveProperty("error");
		});
	});
});
