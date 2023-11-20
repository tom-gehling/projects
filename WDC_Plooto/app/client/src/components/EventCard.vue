<template>
	<div class="bg-secondary rounded-normal event-card shadow-sm">
		<h4>
			<router-link :to="`/event/${event.event_id}`">
				{{ event.title }}
			</router-link>
		</h4>
		<div class="club-name">{{ club?.name }}</div>
		<div>{{ startAndEndTime }}</div>
		<div class="description">{{ event.description }}</div>
		<div class="attendance-container">
			<div>{{ going }} going {{ interested }} interested</div>
		</div>
		<slot></slot>
	</div>
</template>

<script>
import { useClubStore } from "../stores/clubs";
import moment from "moment";
import { useUserInformation } from "../stores/user";
import { useEventStore } from "../stores/events";

export default {
	name: "EventCard",
	props: {
		event: {
			type: Object,
			required: true,
		},
	},
	computed: {
		startAndEndTime() {
			const start = moment(this.event.start_time).calendar({ sameElse: "MMM Do h:mm A" });
			// always display time
			const end = moment(this.event.end_time).calendar({ sameElse: "h:mm A" });
			return `${start} - ${end}`;
		},
		club() {
			const clubStore = useClubStore();
			const club = clubStore.getClubByID(this.event.club_id);
			return club;
		},
		attendance() {
			const userStore = useUserInformation();
			const eventStore = useEventStore();
			const user_id = userStore.getUserID();
			const event_id = this.event?.event_id;
			const attendance = eventStore.getAttendingStatus(event_id, user_id);
			return attendance;
		},
		attendees() {
			const eventStore = useEventStore();
			const attendees = eventStore.getAttendees(this.event.event_id);
			return attendees;
		},
		going() {
			return this.event.going ?? this.attendees.going.length;
		},
		interested() {
			return this.event.interested ?? this.attendees.interested.length;
		}
	},
};
</script>

<style scoped>
h4 {
	font-size: larger;
}

.event-card {
	padding: 20px;
	padding-top: 10px;
	height: auto;
	display: flex;
	flex-direction: column;
	color: var(--text-primary);
	position: relative;
}

.description {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	/* Change this number to the number of lines you want to display */
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--text-secondary);
}

.attendance-container {
	display: flex;
	flex-direction: row;
	gap: 5px;
	color: var(--text-tertiary);
	opacity: 0.75;
}

.club-name {
	color: var(--text-tertiary);
	font-size: smaller;
}
</style>
