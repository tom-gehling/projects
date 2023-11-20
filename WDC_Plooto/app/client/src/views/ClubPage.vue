<template>
	<div v-if="loading" class="loading">
		Loading...
	</div>
	<div v-else class="event-container">
		<div v-if="error.code" class="error">
			{{ error.code }}: {{ error.message }}
		</div>
		<div v-else class="event-details">
			<h1 style="color:var(--text-primary)">{{ club.name }}</h1>
			<p>{{ club.description }}</p>
			<div style="color: var(--text-tertiary)">Created on {{ created }}</div>
			<h2>Admins</h2>
			<div class="members-list">
				<div v-if="admins.length" v-for="admin in admins" :key="admin.user_id"
					class="bg-secondary rounded-normal shadow-sm member-info" style="color: var(--text-secondary)">
					<h4 style="color:var(--text-primary)">{{ admin.first_name }} {{ admin.last_name }}</h4>
					<div style="font-family: monospace">{{ admin.email }}</div>
				</div>
				<div class="not-found" v-else>No admins.</div>

			</div>
			<h2>Members</h2>
			<div class="members-list">
				<div v-if="normal_members.length" v-for="member in normal_members" :key="member.user_id"
					class="bg-secondary rounded-normal shadow-sm member-info" style="color: var(--text-secondary)">
					<h4 style="color:var(--text-primary)">{{ member.first_name }} {{ member.last_name }}</h4>
					<div style="font-family: monospace">{{ member.email }}</div>
				</div>
				<div class="not-found" v-else>No members.</div>
			</div>
			<h2>Events</h2>
			<div class="event-grid">
				<EventCard v-if="events.length" v-for="event in events" :key="event.id" :event="event" />
				<div class="not-found" v-else>No events.</div>
			</div>
			<h2>Posts</h2>
			<TimelineItem v-if="posts.length" v-for="post in posts" :post="post" :key="post.id" />
			<div class="not-found" v-else>No posts.</div>
		</div>
	</div>
</template>

<script>
import moment from "moment";
import { ref } from "vue";
import { fetchClub } from "../functions";
import EventCard from '/src/components/EventCard.vue';
import TimelineItem from '/src/components/TimelineItem.vue';

export default {
	name: "ClubPage",
	components: {
		EventCard,
		TimelineItem
	},
	props: {
		club_id: {
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
		fetchClub(this.club_id).then((result) => {
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
		club() {
			return this.data?.club ?? [];
		},
		admins() {
			return this.members.filter((member) => member.role == 'admin');
		},
		normal_members() {
			return this.members.filter((member) => member.role == 'member');
		},
		members() {
			return this.data?.members ?? [];
		},
		events() {
			return this.data?.events ?? [];
		},
		posts() {
			return this.data?.posts.map((post) => ({ ...post, type: 'post' })) ?? [];
		},
		created() {
			return moment(this.club.created_at).format("MMMM Do YYYY");
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
	color: var(--text-secondary);
}

.not-found {
	color: var(--text-tertiary);
}

.members-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	grid-gap: 1em;
}


.member-image {
	width: 50px;
	height: 50px;
	object-fit: cover;
	margin-right: 1em;
	border-radius: 50%;
}

.member-info {
	display: flex;
	flex-direction: column;
	padding: 10px 20px;
}
</style>