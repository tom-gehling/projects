/* eslint-disable no-tabs */
import { defineStore } from "pinia";

export const useDarkMode = defineStore({
	id: 'dark_mode',
	state: () => ({
		dark_mode: true
	}),
	actions: {
		toggleDarkMode() {
			this.dark_mode = !this.dark_mode;
		}
	}
});
