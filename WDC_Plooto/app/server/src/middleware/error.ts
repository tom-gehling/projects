import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types/common";

export function errorHandler(err: CustomError, req: Request, res: Response, next: NextFunction) {
	const status = err.status ?? 500;
	let stack = err.stack;
	if (process.env.NODE_ENV != "development") stack = undefined;

	res.status(status)
		.json({
			success: false,
			error: err.message,
			stack,
		})
		.end();
}
