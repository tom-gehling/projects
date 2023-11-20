import { loremIpsum } from "lorem-ipsum";
import { resetLastFetch } from "./functions";

/**
 * Returns if the item is active or not
 * @param {{ status: number }} item
 * @returns {boolean}
 */
export const isActive = (item) => item?.status === 1;


/**
 * Gets a random date within a range
 * @param {Date} target
 * @param {number} offset_start offset relative to target in days
 * @param {number} offset_positive offset relative to target in days
 */
export function getRandomDate(target, offset_start, offset_positive) {
	// generates a random date between -1 week and +2 weeks
	const start = new Date(target.getTime() + offset_start * 24 * 60 * 60 * 1000);
	const end = new Date(target.getTime() + offset_positive * 24 * 60 * 60 * 1000);
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
/**
 * Generated a random notification object
 * @param {string} id
 */
export function generateRandomNotification(id) {
	return {
		id,
		title: loremIpsum({ count: 1, units: "words" }),
		body: loremIpsum({ count: 1, units: "sentences" }),
		created_at: getRandomDate(new Date(), -7, 0),
		read: false,
		picture: `https://picsum.photos/200/300`
	};
}

/**
 * Converts a date object to a datetime-local accepted string
 * @param {Date} date
 */
export const dateToDateTime = (date) => {
	if (!date) return null;
	return date
		.toLocaleString("sv-SE", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		})
		.replace(" ", "T");
};


export function dateToLocalISO(dateString) {
	let date = new Date(dateString);
	let offsetMs = date.getTimezoneOffset() * 60 * 1000;
	let localISO = new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
	return localISO;
}


class Request {
	constructor() {
		this.base_url = "http://127.0.0.1:8080";
	}

	async request(url, body) {
		const response = await fetch(`${this.base_url}${url}`, body);

		let data;
		try {
			data = await response.json();
		} catch (error) {
			return { success: false, error: error, data: null, code: response.status };
		}

		if (!data.success) {
			return { success: false, error: data.error, data: null, code: response.status };
		}

		if (response.refetch_data) {
			// reset the lastFetch counter
			resetLastFetch();
		}

		return { success: true, error: null, data: data.data, code: response.status };
	}

	async get(url) {
		return this.request(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "include"
		});
	}

	async post(url, data) {
		return this.request(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "include",
			body: JSON.stringify(data)
		});
	}

	async put(url, data) {
		return this.request(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "include",
			body: JSON.stringify(data)
		});
	}

	async delete(url, data) {
		return this.request(url, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "include",
			body: JSON.stringify(data)
		});
	}
}

export const server = new Request();
