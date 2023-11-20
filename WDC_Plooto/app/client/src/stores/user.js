/* eslint-disable no-tabs */
import { defineStore } from "pinia";
import router from "../router/index";
import { generateRandomNotification, server } from "../utils";

const notification_ids = () => {
	// generate 30 uuids
	let ids = [];
	for (let i = 0; i < 30; i++) {
		ids.push(crypto.randomUUID());
	}
	return ids;
};
// const notifications = notification_ids().map((id) => generateRandomNotification(id));

/**
 * @typedef {Object} User
 * @property {string} user_id
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string | null} picture_url
 * @property {string | null} phone_number
 * @property {boolean} system_admin
 * @property {Date | null} birth_date
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {0 | 1} status - 0: inactive, 1: active
 */

export const useUserInformation = defineStore({
	id: 'user',
	state: () => ({
		/** @type {User | null} */
		user: null,
		notifications: []
	}),
	actions: {
		setUserInformation(user) {
			this.user = user;
		},
		getUserID() {
			return this.user?.user_id;
		},
		getName() {
			if (!this.user) return "N/A";
			return this.user.first_name + " " + this.user.last_name;
		},
		getUserInformation() {
			return this.user;
		},
		async authCheck() {
			if (this.user?.user_id) {
				// already logged in
				return true;
			}
			const response = await server.get("/api/user/data");
			if (!response.success) {
				router.push("/login");
				return false;
			}
			this.setUserInformation(response.data);
			return true;
		},
		async login(email, password) {
			const response = await server.post("/api/user/login", { username: email, password });
			return response.success;
		},
		async create(userData) {
			const response = await server.post("/api/user/create", userData);
			if (!response.success) return response;

			this.setUserInformation(response.data.user);
			return response;
		},
		async update(userData) {
			const response = await server.put("/api/user/update", userData);
			if (!response.success) return response;

			this.setUserInformation(JSON.parse(JSON.stringify(userData)));

			return response;
		},
		addNotifications(nots) {
			// add notifications to the store or update existing ones
			nots.forEach((notification) => {
				const index = this.notifications.findIndex((n) => n.notification_id === notification.notification_id);
				if (index !== -1) {
					this.notifications[index] = notification;
				} else {
					this.notifications.push(notification);
				}
			});
		}
	}
});

