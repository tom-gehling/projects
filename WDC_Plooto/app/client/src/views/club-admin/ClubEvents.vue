<template>
	<div class="club-events-container">
		<div class="search-bar">
			<input type="text" v-model="searchQuery" placeholder="Search Events..." />
			<button class="create-event-button generic-button shadow-sm" @click="createEvent">Create Event</button>
		</div>
		<div class="event-grid">
			<EventCard v-for="event in filteredEvents" :key="event.id" :event="event">
				<button class="event-editor-button generic-button shadow-sm" @click.stop="editEvent(event)">
					<Edit :size="18" />
				</button>
			</EventCard>
		</div>
		<dialog id="eventEditor" class="dialog">
			<EventEditor :event="selectedEvent" v-if="showEditor" @create="createNewEvent" @update="updateEvent"
				@close="closeDialog" :mode="selectedEvent ? 'edit' : 'create'" />
		</dialog>
	</div>
</template>

<script>
import { Edit } from "lucide-vue-next";
import EventCard from "/src/components/EventCard.vue";
import EventEditor from "/src/components/EventEditor.vue";
import { useEventStore } from "/src/stores/events";
import { server } from "/src/utils";

export default {
	name: "ClubEvents",
	components: {
		EventCard,
		Edit,
		EventEditor,
	},
	props: {
		club_id: {
			type: String,
			required: false,
		},
	},
	mounted() {
		// fetch assocations from server and store member data.
		// these associations will have additonal data, including names, emails etc.
		const fetchEvents = async () => {
			const response = await server.post("/api/club/events", { club_id: this.club_id });
			if (!response.success) return;

			const { events, attendance } = response.data;

			const eventStore = useEventStore();
			eventStore.addEvents(events);
			eventStore.addEventAttendance(attendance);
		};

		fetchEvents();
	},
	data() {
		return {
			selectedEvent: null,
			showEditor: false,
			searchQuery: '',
		};
	},
	computed: {
		club_events() {
			const eventStore = useEventStore();
			return eventStore.getEventByClubIDs([this.club_id]);
		},

		filteredEvents() {
			const eventStore = useEventStore();
			const events = eventStore.getEventByClubIDs([this.club_id]);

			if (!this.searchQuery) {
			return events;
			}

			const search = this.searchQuery.toLowerCase();
			return events.filter(event => event.title.toLowerCase().includes(search));
		},
	},
	methods: {
		editEvent(event) {
			this.selectedEvent = event;
			this.openDialog();
		},
		closeDialog() {
			const dialog = document.getElementById("eventEditor");
			dialog.close();
			this.showEditor = false;
		},
		openDialog() {
			const dialog = document.getElementById("eventEditor");
			dialog.showModal();
			this.showEditor = true;
		},
		async updateEvent(event) {
			const eventStore = useEventStore();
			const response = await eventStore.updateEvent(event);
			if (!response.success) {
				alert(response.error);
				return;
			}
			this.closeDialog();
		},
		async createNewEvent(event) {
			const eventStore = useEventStore();
			const response = await eventStore.createEvent({ ...event, club_id: this.club_id });
			if (!response.success) {
				alert(response.error);
				return;
			} else {
				this.closeDialog();
			}
		},
		createEvent() {
			this.selectedEvent = null;
			this.openDialog();
		},
	},
};
</script>

<style scoped>
.event-editor-button {
	position: absolute;
	bottom: 8px;
	right: 8px;
	background-color: var(--bg-tertiary);
	padding: 8px 13px;
	padding-bottom: 6px;
}

.club-events-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.search-bar {
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
}

select {
	width: min-content;
}

.dialog {
	width: min(80%, 1200px);
}

.create-event-button {
	margin-left: auto;
}
</style>
