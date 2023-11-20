import { defineStore } from "pinia";
import { isActive, server } from "../utils";

/**
 * @typedef {Object} Event
 * @property {string} event_id
 * @property {string} title
 * @property {string} description
 * @property {{lat: number, lng: number}} location
 * @property {Date} start_time
 * @property {Date} end_time
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {"public" | "private" | "member"} privacy
 * @property {string} club_id
 * @property {0 | 1} status - 0: inactive, 1: active
 *
 */

/**
 * @typedef {Object} EventAttendance
 * @property {string} event_id
 * @property {string} user_id
 * @property {"going" | "maybe" | "not_going"} rsvp
 */


export const useEventStore = defineStore({
	id: 'events',
	state: () => ({
		/** @type {Event[]} */
		events: [],
		/** @type {EventAttendance[]} */
		event_attendance: []
	}),
	getters: {
		getEventByClubIDs: (state) => (club_ids) => state.events.filter((event) => club_ids.includes(event.club_id)).filter(isActive),
		getEventByID: (state) => (event_id) => state.events.filter(isActive).find((event) => event.event_id === event_id),
		getEventsByUserID: (state) => (user_id) => state.event_attendance.filter((event) => event.user_id === user_id),
		getUsersGoingToEvent: (state) => (event_id) => state.event_attendance.filter((event) => event.event_id === event_id && event.rsvp === "going"),
		getAttendingStatus: (state) => (event_id, user_id) => {
			const found_event = state.event_attendance.find((event) => event.event_id === event_id && event.user_id === user_id);
			return found_event?.rsvp ?? "none";
		},
		getAttendees: (state) => (event_id) => {
			// get an object that contains the user_id of interest and going
			const going = state.event_attendance.filter((event) => event.event_id === event_id && event.rsvp === "going");
			const interested = state.event_attendance.filter((event) => event.event_id === event_id && event.rsvp === "interested");

			return { going, interested };
		},
		getPopularEvents: (state) => (count) => {
			// get the events with most people attending (going or interested)
			// use the this.getAttendees function to get the list of attendees
			// sort the events by the number of attendees
			const events = state.events.map((event) => {
				const { going, interested } = state.getAttendees(event.event_id);
				return { event, attendees: going.length + interested.length };
			});

			events.sort((a, b) => b.attendees - a.attendees);

			return events.slice(0, count).map((obj) => obj.event).filter(isActive);
		}
	},
	actions: {
		async updateRSVP(event_id, user_id, newRSVP) {
			const response = await server.put("/api/event/attendance", { event_id, user_id, rsvp: newRSVP });
			if (!response.success) return response;

			const index = this.event_attendance.findIndex((event) => event.event_id === event_id && event.user_id === user_id);
			if (index !== -1) {
				this.event_attendance[index].rsvp = newRSVP;
			} else {
				this.event_attendance.push({ event_id, user_id, rsvp: newRSVP });
			}

			return response;
		},
		async updateEvent(updatedEvent) {
			const response = await server.put("/api/event/update", updatedEvent);
			if (!response.success) return response;
			// update local store
			this.events = this.events.map((event) => {
				if (event.event_id === updatedEvent.event_id) {
					return updatedEvent;
				}
				return event;
			});
			return response;

		},
		async createEvent(newEvent) {
			// generate event id
			const event = { event_id: crypto.randomUUID(), ...newEvent };
			const response = await server.post("/api/event/create", event);
			if (!response.success) return response;
			// update local store
			this.events.push(event);
			return response;
		},
		addEvents(events) {
			// add events to the store or update existing events
			events.forEach((event) => {
				const index = this.events.findIndex((e) => e.event_id === event.event_id);
				if (index !== -1) {
					this.events[index] = event;
				} else {
					this.events.push(event);
				}
			});
		},
		addEventAttendance(event_attendances) {
			// add event attendnace to the store or update existing event attendance
			event_attendances.forEach((event_attendance) => {
				const index = this.event_attendance.findIndex((e) => e.event_id === event_attendance.event_id && e.user_id === event_attendance.user_id);
				if (index !== -1) {
					this.event_attendance[index] = event_attendance;
				} else {
					this.event_attendance.push(event_attendance);
				}
			});
		}

	}
});

