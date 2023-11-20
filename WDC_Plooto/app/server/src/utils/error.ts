import { CustomError } from "../types/common";

export function getCustomError(status: number, mesasge: string) {
	const err: CustomError = new Error(mesasge);
	err.status = status;
	return err;
}

export function getDatabaseError() {
	return getCustomError(503, "Database not found");
}
