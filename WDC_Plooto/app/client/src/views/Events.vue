<template>
	<div class="event-page">
		<div class="bg-primary rounded-normal your-events shadow-sm">
			<h3>Your Events</h3>
			<div class="event-grid">
				<EventCard v-for="event in user_events" :key="event.id" :event="event">
					<select :value="event.rsvp" class="attendance-selector shadow-sm" @change="updateRSVP($event, event)">
						<option value="going">Going</option>
						<option value="interested">Interested</option>
						<option value="none">None</option>
					</select>
				</EventCard>
			</div>
		</div>
		<div class="bg-primary rounded-normal discover-events shadow-sm">
			<div class="find-events-header">
				<h3>Find Events</h3>
				<input type="text" placeholder="Search events..." v-model="searchInput" class="shadow-xs" />
			</div>
			<nav>
				<router-link to="/events/results" tag="div" active-class="selected"
					exact-active-class="selected">Results</router-link>
				<router-link to="/events/top" tag="div" active-class="selected"
					exact-active-class="selected">Top</router-link>
				<router-link to="/events/local" tag="div" active-class="selected"
					exact-active-class="selected">Local</router-link>
				<router-link to="/events/this_week" tag="div" active-class="selected" exact-active-class="selected">This
					Week</router-link>
				<router-link to="/events/following" tag="div" active-class="selected"
					exact-active-class="selected">Following</router-link>
			</nav>
			<div class="event-grid">
				<EventCard v-for="event in other_events" :key="event.event_id" :event="event">
					<select :value="event.rsvp" class="attendance-selector shadow-sm" @change="updateRSVP($event, event)">
						<option value="going">Going</option>
						<option value="interested">Interested</option>
						<option value="none">None</option>
					</select>
				</EventCard>
			</div>
		</div>
	</div>
</template>

<script>
import { onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import EventCard from "../components/EventCard.vue";
import { fetchEvents } from "../functions";
import { useClubStore } from "../stores/clubs";
import { useEventStore } from "../stores/events";
import { useUserInformation } from "../stores/user";
import { isActive } from "../utils";

export default {
	name: "Events",
	components: {
		EventCard,
	},
	props: {
		filter: {
			type: String,
			required: false,
		},
	},
	setup() {
		const searchInput = ref("");
		const router = useRouter();

		const updateRouteAndResults = async () => {
			if (searchInput.value) {
				await router.push("/events/results");
			}
		};
		const unwatch = watch(searchInput, updateRouteAndResults);

		onUnmounted(() => {
			unwatch();
		});

		fetchEvents();

		return {
			searchInput,
		};
	},
	computed: {
		user_events() {
			const eventStore = useEventStore();
			const user_id = useUserInformation().getUserID();

			return eventStore
				.getEventsByUserID(user_id)
				.filter((assoc) => assoc.rsvp != "none")
				.map((assoc) => ({ ...eventStore.getEventByID(assoc.event_id), rsvp: assoc.rsvp }))
				.filter(isActive);
		},
		other_events() {
			const eventStore = useEventStore();
			const other_events = this.getOtherEvents();
			const user_id = useUserInformation().getUserID();

			return other_events.map((event) => ({ ...event, rsvp: eventStore.getAttendingStatus(event.event_id, user_id) }));
		},
	},
	methods: {
		isWithinWeek(date, start, end) {
			const eventDate = new Date(date);
			return eventDate >= start && eventDate <= end;
		},
		getOtherEvents() {
			const eventStore = useEventStore();
			const user_events_ids = this.user_events.map((event) => event.event_id);
			const non_user_events = eventStore.events.filter(isActive).filter((event) => !user_events_ids.includes(event.event_id));

			switch (this.filter) {
				case "results":
					// search results
					return non_user_events.filter((event) => event.title && event.title.toLowerCase().includes(this.searchInput.trim().toLowerCase()));
				case "top":
					// gets the top 10 events that the user is not attending
					/** @todo include some date filtering so that only events coming up are included */
					const top_events = eventStore.getPopularEvents(10); // get top 10
					return top_events.filter((event) => !user_events_ids.includes(event.event_id));
				case "this_week":
					// events coming up within a week, sorted by start time.
					const today = new Date();
					const start = today;
					const end = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
					return non_user_events
						.filter((event) => this.isWithinWeek(event.start_time, start, end))
						.sort((a, b) => {
							const dateA = new Date(a.start_time);
							const dateB = new Date(b.start_time);
							return dateA - dateB;
						});
				case "following":
					// events by clubs that the user is a part of
					const clubStore = useClubStore();
					const user_clubs = clubStore.getClubsByUserIDs([useUserInformation().getUserID()]);
					const user_club_ids = user_clubs.map((club) => club.club_id);
					return non_user_events.filter((event) => user_club_ids.includes(event.club_id));
				case "local":
					return [];
				default:
					return non_user_events;
			}
		},
		async updateRSVP(event, eventObj) {
			const newRSVP = event.target.value;
			const eventStore = useEventStore();
			const user_id = useUserInformation().getUserID();

			const result = await eventStore.updateRSVP(eventObj.event_id, user_id, newRSVP);
			if (!result.success) {
				alert(result.error);
			}
		},
	},
};
</script>

<style scoped>
.find-events-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.your-events {
	max-height: 45vh;
	overflow-y: auto;
}

.discover-events {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

nav {
	display: flex;
	flex-direction: row;
	gap: 10px;
}

h3 {
	margin: 10px 0px;
	color: var(--text-primary);
}

.event-page {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.event-page>* {
	padding: 20px;
}

.attendance-selector {
	position: absolute;
	bottom: 10px;
	right: 10px;
	width: min-content;
}
</style>
