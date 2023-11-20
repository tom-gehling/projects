<template>
	<div v-if="loading" class="loading">
		Loading...
	</div>
	<div v-else class="event-container">
		<div v-if="error.code" class="error">
			{{ error.code }}: {{ error.message }}
		</div>
		<div v-else class="event-details">
			<div class="bg-primary rounded-normal shadow-sm" style="padding: 10px 20px;">
				<h2 style="color: var(--text-primary)">{{ event.title }}</h2>
				<p style="color: var(--text-secondary); font-size: smaller">{{ start_time }} - {{ end_time }}</p>
				<p style="color: var(--text-secondary)">{{ event.description }}</p>
			</div>

			<div class="bg-primary rounded-normal shadow-sm" style="padding: 10px 20px;">
				<h2 style="color: var(--text-primary); margin-bottom: 10px;">Attending</h2>
				<div class="members-list" style="margin: unset;">
					<div v-for="member in members" :key="member.user_id"
						class="member-item bg-secondary rounded-normal shadow-sm">
						<img v-if="member.picture_url" :src="member.picture_url" alt="Member Image" class="member-image">
						<div class="member-info" style="color: var(--text-secondary)">
							<h4 style="color: var(--text-primary)">{{ member.first_name }} {{ member.last_name }}</h4>
							<p>{{ member.email }}</p>
							<p>RSVP: {{ member.rsvp }}</p>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>

<script>
import moment from "moment";
import { ref } from "vue";
import { fetchEvent } from "../functions";

export default {
	name: "EventPage",
	props: {
		event_id: {
			type: String,
			required: true
		}
	},
	setup() {
		const data = ref(null);
		const loading = ref(true);
		const error = ref({ code: null, message: null });

		return {
			data,
			loading,
			error
		};
	},
	mounted() {
		// fetch the event from event_id
		fetchEvent([this.event_id]).then((result) => {
			this.loading = false;
			if (result.success) {
				this.data = result.data;
			} else {
				this.error.code = result.code;
				this.error.message = result.error;
			}
		});
	},
	computed: {
		start_time() {
			return moment(this.event.start_time).format("MMMM Do YYYY, h:mm:ss a");
		},
		end_time() {
			return moment(this.event.end_time).format("MMMM Do YYYY, h:mm:ss a");
		},
		event() {
			return this.data?.events?.[0];
		},
		members() {
			return this.data?.members;
		}
	}

};
</script>

<style scoped>
.loading {
	text-align: center;
	padding: 2em;
}

.error {
	color: red;
	padding: 2em;
}

.event-container {
	padding: 2em;
}

.event-details {
	margin-bottom: 2em;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.members-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	grid-gap: 1em;
}

.member-item {
	display: flex;
	align-items: center;
	padding: 5px 10px;
}

.member-image {
	width: 50px;
	height: 50px;
	object-fit: cover;
	margin-right: 1em;
	border-radius: 50%;
}

.member-info {
	flex: 1;
}
</style>