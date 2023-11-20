<template>
	<div class="container">
		<nav>
			<h3>{{ club?.name }}</h3>
			<router-link :to="`/club-admin/${club_id}/information`" active-class="selected" exact-active-class="selected">Information</router-link>
			<router-link :to="`/club-admin/${club_id}/members`" active-class="selected" exact-active-class="selected">Members</router-link>
			<router-link :to="`/club-admin/${club_id}/events`" active-class="selected" exact-active-class="selected">Events</router-link>
			<router-link :to="`/club-admin/${club_id}/posts`" active-class="selected" exact-active-class="selected">Posts</router-link>
		</nav>
		<div class="settings-content">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import { useClubStore } from "../stores/clubs";

export default {
	name: "ClubAdmin",
	props: {
		club_id: {
			type: String,
			required: false,
		},
		filter: {
			type: String,
			required: false,
		},
	},
	computed: {
		club() {
			const clubStore = useClubStore();
			return this.club_id ? clubStore.getClubByID(this.club_id) : null;
		},
	},
};
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
nav {
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
	border-radius: var(--normal-border-radius);
	background-color: var(--bg-primary);
	padding: 10px 20px;
	flex-wrap: wrap;
}

h3 {
	margin-right: 20px;
	color: var(--text-primary);
}

.settings-content {
	background-color: var(--bg-primary);
	border-radius: var(--normal-border-radius);
	padding: 20px;
}
</style>
