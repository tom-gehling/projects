import { NextFunction, Response } from "express";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).json({ message: "You need to be authenticated to access this route." }).end();
};
