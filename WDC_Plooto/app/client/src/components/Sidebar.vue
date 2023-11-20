<template>
	<aside class="sidebar bg-primary">
		<nav>
			<router-link to="/" active-class="selected" exact-active-class="selected"> Home </router-link>
			<div :class="{ 'dropdown-bg': route.path.startsWith('/events') }">
				<router-link to="/events" active-class="selected" exact-active-class="selected"> Events </router-link>
				<div v-if="route.path.startsWith('/events')" class="dropdown">
					<router-link to="/events/results" active-class="selected" exact-active-class="selected"> Results
					</router-link>
					<router-link to="/events/top" active-class="selected" exact-active-class="selected"> Top </router-link>
					<router-link to="/events/local" active-class="selected" exact-active-class="selected"> Local
					</router-link>
					<router-link to="/events/this_week" active-class="selected" exact-active-class="selected"> This Week
					</router-link>
					<router-link to="/events/following" active-class="selected" exact-active-class="selected"> Following
					</router-link>
				</div>
			</div>

			<div :class="{ 'dropdown-bg': route.path.startsWith('/clubs') }">
				<router-link to="/clubs" active-class="selected" exact-active-class="selected"> Clubs </router-link>
				<div v-if="route.path.startsWith('/clubs')" class="dropdown">
					<router-link to="/clubs/results" active-class="selected" exact-active-class="selected"> Results
					</router-link>
					<router-link to="/clubs/popular" active-class="selected" exact-active-class="selected"> Popular
					</router-link>
					<router-link to="/clubs/new_clubs" active-class="selected" exact-active-class="selected"> New Clubs
					</router-link>
				</div>
			</div>
			<div class="dropdown-bg">
				<div class="fake-link">Club Management</div>
				<div class="dropdown">
					<router-link v-for="club in admin_clubs" :key="club?.club_id"
						:to="`/club-admin/${club?.club_id}/information`"
						:class="{ selected: route.path.startsWith(`/club-admin/${club?.club_id}`) }">{{ club?.name
						}}</router-link>
					<button class="fake-link generic-button" style="cursor: pointer; margin-top: 5px; text-align: left"
						@click="createClub">+ Create New</button>
				</div>
			</div>
			<dialog id="clubEditor" class="dialog">
				<ClubEditor v-if="showEditor" :club="selectedClub" @close="closeDialog" @update="updateClub"
					:mode="selectedClub ? 'edit' : 'create'" />
			</dialog>
		</nav>
	</aside>
</template>

<script>
import { useRoute } from "vue-router";
import { useClubStore } from "../stores/clubs";
import { useUserInformation } from "../stores/user";
import ClubEditor from "../components/ClubEditor.vue";

export default {
	name: "Sidebar",
	components: {
		ClubEditor,
	},
	data() {
		return {
			selectedClub: null,
			showEditor: false,
		};
	},
	setup() {
		const route = useRoute();

		return {
			route,
		};
	},
	computed: {
		admin_clubs() {
			const clubStore = useClubStore();
			const user_id = useUserInformation()?.getUserInformation()?.user_id;

			const admin_clubs = clubStore.getUserAdminClubs(user_id);

			return admin_clubs ?? [];
		},
	},
	methods: {
		createClub() {
			this.selectedClub = null;
			this.openDialog();
		},
		closeDialog() {
			const dialog = document.getElementById("clubEditor");
			dialog.close();
			this.showEditor = false;
		},
		openDialog() {
			const dialog = document.getElementById("clubEditor");
			dialog.showModal();
			this.showEditor = true;
		},
		async updateClub(club) {
			const clubStore = useClubStore();
			const user_id = useUserInformation().getUserID();
			let result = null;
			if (this.selectedClub) {
				result = clubStore.updateClub(club);
			} else {
				result = await clubStore.createClub(club);
				if (result.success) {
					const club_id = result.ID;
					clubStore.setUserRole(club_id, user_id, "admin");
				}
			}
			if (!result.success) {
				alert(result.error);
			}
			this.closeDialog();
		},
	},
};
</script>

<style scoped>
.dropdown {
	display: flex;
	flex-direction: column;
	padding: 0px 15px;
	padding-bottom: 15px;
}

.sidebar {
	height: 100%;
	width: var(--sidebar-width);
	flex-shrink: 0;
	padding: 20px;
}

nav {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-top: 20px;
}

.dialog {
	width: min(80%, 400px);
}
</style>
