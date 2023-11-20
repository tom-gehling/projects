import express from "express";
import { OkPacket, RowDataPacket } from "mysql2";
import { z } from "zod";
import { CustomError } from "../types/common";
import { DbRequest } from "../types/types";
import { getCustomError } from "../utils/error";
import { newPost } from "../utils/notifications";

const router = express.Router();

router.post("/fetch", async (req: DbRequest, res, next) => {
	const schema = z.object({
		post_ids: z.array(z.string().uuid()),
	});

	const input = schema.safeParse(req.body);
	if (!input.success) return next(getCustomError(422, "Invalid Post IDs"));

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [posts] = await database.query<RowDataPacket[]>("SELECT * FROM Post WHERE post_id IN (?)", [input.data.post_ids]);

	res.status(200).json({ success: true, error: null, data: { posts } }).end();
});

// create a new post
router.post("/create", async (req: DbRequest, res, next) => {
	const schema = z.object({
		post_id: z.string().uuid(),
		title: z.string(),
		content: z.string(),
		club_id: z.string(),
		event_id: z.string().nullable(),
	});

	const input = schema.safeParse(req.body);
	if (!input.success) return next(new Error("Invalid post data.\n" + input.error.message));

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	// check that the post doesn't already exist with the same ID
	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Post WHERE post_id = ?", [input.data.post_id]);
	if (rows.length) {
		const err: CustomError = new Error("Post already exists");
		err.status = 403;
		return next(err);
	}

	await database.query<OkPacket>(
		"INSERT INTO Post (post_id, author_id, title, content, club_id, event_id) VALUES (?, ?, ?, ?, ?, ?)",
		[input.data.post_id, req.user?.user_id, input.data.title, input.data.content, input.data.club_id, input.data.event_id]
	)

	await newPost(database, input.data.post_id);

	res.json({ success: true, error: null, ID: input.data.post_id, refetch_data: true }).end();
});

// update a post
router.put("/update", async (req: DbRequest, res, next) => {
	const schema = z.object({
		post_id: z.string().uuid(),
		title: z.string().optional(),
		content: z.string().optional(),
		status: z.union([z.literal(0), z.literal(1)]).optional(),
	});

	const input = schema.safeParse(req.body);
	if (!input.success) return next(new Error("Invalid post data.\n" + input.error.message));

	const database = req.db;
	if (!database) {
		const err: CustomError = new Error("Database not found");
		err.status = 503;
		return next(err);
	}

	const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM Post WHERE post_id = ?", [input.data.post_id]);

	if (!rows.length) {
		const err: CustomError = new Error("Post doesn't exist");
		err.status = 404;
		return next(err);
	}

	await database.query<OkPacket>("UPDATE Post SET title = ?, content = ?, status = ? WHERE post_id = ?", [
		input.data.title ?? rows[0].title,
		input.data.content ?? rows[0].content,
		input.data.status ?? rows[0].status,
		input.data.post_id,
	]);

	res.json({ success: true, error: null }).end();
});

export default router;
