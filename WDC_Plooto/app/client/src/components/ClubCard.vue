<template>
	<div class="bg-secondary rounded-normal club-card shadow-sm">
		<h4 :title="'ID: ' + club.club_id">
			<router-link :to="`/club/${club.club_id}`">
				{{ club.name }}
			</router-link>
		</h4>

		<div>{{ club.description }}</div>
		<div>Created {{ created_at }}</div>
		<div>{{ privacy }}</div>
		<pre v-if="role">{{ role }}</pre>
		<button v-if="!role && !isPrivate" class="generic-button shadow-sm" id="join-button" @click="joinClub">Join</button>
		<button v-if="!role && isPrivate" class="generic-button shadow-sm" id="request-join-button" :disabled="hasRequest"
			@click="requestJoinClub">
			<span v-if="hasRequest">
				Requested
			</span>
			<span v-else>
				Request To Join
			</span>
		</button>
		<button v-if="role" class="generic-button shadow-sm" id="leave-button" @click="leaveClub">Leave</button>
	</div>
</template>

<script>
import { useClubStore } from "../stores/clubs";
import { useUserInformation } from "../stores/user";
import moment from "moment";

export default {
	name: "ClubCard",
	props: {
		club: {
			type: Object,
			required: true,
		},
	},
	computed: {
		role() {
			const userStore = useUserInformation();
			const clubStore = useClubStore();

			const role = clubStore.getUserRoleInClub(this.club.club_id, userStore.getUserID());

			return role;
		},
		created_at() {
			return moment(this.club.created_time).calendar();
		},
		privacy() {
			return this.club.private ? 'Private' : 'Public';
		},
		isPrivate() {
			return this.club.private;
		},
		hasRequest() {
			const clubStore = useClubStore();
			return clubStore.getUserRequest(this.club.club_id, useUserInformation().getUserID());
		}
	},
	methods: {
		async joinClub() {
			const clubStore = useClubStore();
			const user_id = useUserInformation().getUserID();
			const result = await clubStore.joinClub(this.club.club_id, user_id);
			if (!result.success) {
				alert(result.error);
			}
		},

		async requestJoinClub() {
			if (this.hasRequest) return;
			const clubStore = useClubStore();
			const user_id = useUserInformation().getUserID();
			const result = await clubStore.requestJoinClub(this.club.club_id, user_id);
			if (!result.success) {
				alert(result.error);
			}
		},

		async leaveClub() {
			const clubStore = useClubStore();
			const user_id = useUserInformation().getUserID();
			const result = await clubStore.leaveClub(this.club.club_id, user_id);
			if (!result.success) {
				alert(result.error);
			}
		},
	},
};
</script>

<style scoped>
h4 {
	font-size: larger;
}

.club-card {
	padding: 20px;
	height: 15rem;
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
}

#join-button,
#request-join-button {
	position: absolute;
	bottom: 20px;
	right: 20px;
}

#leave-button {
	position: absolute;
	bottom: 20px;
	right: 20px;
}
</style>
