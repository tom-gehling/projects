// types.d.ts
import { Request } from "express";
import { Connection } from "mysql2/promise";

export interface DbRequest extends Request {
	db?: Connection;
}

// override Express.User with our own user that has id property
declare global {
	namespace Express {
		interface User {
			user_id: string;
			password: string;
			email: string;
		}
	}
}
