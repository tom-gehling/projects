<template>
	<div>
		<h1>Admin</h1>
		<section>
			<h2>Users</h2>
			<div v-for="user in users" :key="user.user_id">
				{{ user.first_name }} {{ user.last_name }}
				<button v-if="user.status == 1" @click="deleteUser(user.user_id)">Delete User</button>
				<button v-if="user.status == 0" @click="restoreUser(user.user_id)">Restore User</button>
			</div>
		</section>
		<section>
			<h2>Events</h2>
			<div v-for="event in events" :key="event.event_id">
				{{ event.title }}
				<button v-if="event.status == 1" @click="deleteEvent(event.event_id)">Delete Event</button>
				<button v-if="event.status == 0" @click="restoreEvent(event.event_id)">Restore Event</button>
			</div>
		</section>
		<section>
			<h2>Clubs</h2>
			<div v-for="club in clubs" :key="club.club_id">
				<div style="display: flex; align-items: center; flex-direction: row; gap: 5px;">
					<h3>{{ club.name }}</h3>
					<button v-if="club.status == 1" @click="deleteClub(club.club_id)">Delete Club</button>
					<button v-if="club.status == 0" @click="restoreClub(club.club_id)">Restore Club</button>
				</div>

				<div v-for="member in club.members" :key="member.user_id"
					style="display: flex; align-items: center; flex-direction: row; gap: 5px;">
					<p>{{ member.first_name }} {{ member.last_name }}</p>
					<button @click="removeMember(club.club_id, member.user_id)">Remove Member</button>
				</div>
			</div>
		</section>
	</div>
</template>


<script>
import { fetchAdminData, resetLastFetch } from "../../functions";
import { server } from "../../utils";

export default {
	name: "Admin",
	data() {
		return {
			data: null,
			loading: true,
			error: { code: null, message: null }
		};
	},
	mounted() {
		fetchAdminData().then((result) => {
			this.loading = false;
			if (result.success) {
				this.data = result.data;

				// Combine clubs and members
				this.data.clubs = this.data.clubs.map(club => {
					club.members = this.data.clubUsers
						.filter(cu => cu.club_id === club.club_id)
						.map(cu => this.data.users.find(u => u.user_id === cu.user_id));

					return club;
				});

			} else {
				this.error.code = result.code;
				this.error.message = result.error;
			}
		});
	},
	computed: {
		users() {
			return this.data?.users;
		},
		events() {
			return this.data?.events;
		},
		clubs() {
			return this.data?.clubs;
		},
		clubUsers() {
			return this.data?.clubUsers;
		}
	},
	methods: {
		async deleteUser(user_id) {
			if (confirm("Are you sure you want to delete this user?")) {
				const result = await server.put("/api/user/update", { user_id, status: 0 });
				if (!result.success) {
					alert(result.error);
				} else {
					// set the status of the user to 0
					this.data.users.find(u => u.user_id === user_id).status = 0;
					resetLastFetch();
				}
			}
		},
		async restoreUser(user_id) {
			if (confirm("Are you sure you want to restore this user?")) {
				const result = await server.put("/api/user/update", { user_id, status: 1 });
				if (!result.success) {
					alert(result.error);
				} else {
					// set the status of the user to 1
					this.data.users.find(u => u.user_id === user_id).status = 1;
					resetLastFetch();
				}
			}
		},
		async deleteEvent(event_id) {
			if (confirm("Are you sure you want to delete this event?")) {
				const result = await server.put("/api/event/update", { event_id, status: 0 });
				if (!result.success) {
					alert(result.error);
				} else {
					// set the status of the event to 0
					this.data.events.find(e => e.event_id === event_id).status = 0;
					resetLastFetch();
				}
			}
		},
		async restoreEvent(event_id) {
			if (confirm("Are you sure you want to restore this event?")) {
				const result = await server.put("/api/event/update", { event_id, status: 1 });
				if (!result.success) {
					alert(result.error);
				} else {
					// set the status of the event to 1
					this.data.events.find(e => e.event_id === event_id).status = 1;
					resetLastFetch();
				}
			}
		},
		async deleteClub(club_id) {
			if (confirm("Are you sure you want to delete this club?")) {
				const result = await server.put("/api/club/update", { club_id, status: 0 });
				if (!result.success) {
					alert(result.error);
				} else {
					// set the status of the club to 0
					this.data.clubs.find(c => c.club_id === club_id).status = 0;
					resetLastFetch();
				}
			}
		},
		async restoreClub(club_id) {
			if (confirm("Are you sure you want to restore this club?")) {
				const result = await server.put("/api/club/update", { club_id, status: 1 });
				if (!result.success) {
					alert(result.error);
				} else {
					// set the status of the club to 1
					this.data.clubs.find(c => c.club_id === club_id).status = 1;
					resetLastFetch();
				}
			}
		},
		async removeMember(club_id, user_id) {
			if (confirm("Are you sure you want to remove this member?")) {
				const result = await server.post("/api/club/kick", { club_id, user_id });
				if (!result.success) {
					alert(result.error);
				} else {
					// remove the member from the club
					this.data.clubs.find(c => c.club_id === club_id).members = this.data.clubs.find(c => c.club_id === club_id).members.filter(m => m.user_id !== user_id);
					resetLastFetch();
				}
			}
		}

	}
}

</script>
