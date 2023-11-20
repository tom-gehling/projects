import express, { Response } from "express";
import { z } from "zod";
import { CustomError } from "../types/common";

const router = express.Router();

// reply with a greeting
router.get("/", (_, res: Response) => {
	res.send("Hello there!").end();
});

// throw a standard Error
router.get("/error/standard", () => {
	throw new Error("This is a standard Error");
});

// throw a custom Error with status code
router.get("/error/custom", (req, res, next) => {
	const err: CustomError = new Error("This is a custom Error");
	err.status = 403;
	return next(err);
});

// trigger a Zod validation error
router.post("/error/validation", (req, res, next) => {
	const schema = z.object({
		requiredField: z.string(),
	});

	schema.parse(req.body);
	res.status(200).send("Validation successful!").end();
});

export default router;
