<template>
	<div class="club-page">
		<div class="bg-primary rounded-normal your-clubs shadow-sm">
			<h3>Your Clubs</h3>
			<div class="club-grid">
				<ClubCard v-for="club in user_clubs" :key="club.club_id" :club="club" />
			</div>
		</div>
		<div class="bg-primary rounded-normal find-clubs shadow-sm">
			<div class="find-clubs-header">
				<h3>Find Clubs</h3>
				<input type="text" placeholder="Search clubs..." v-model="searchInput" class="shadow-xs" />
			</div>
			<nav>
				<router-link to="/clubs/results" tag="div" active-class="selected"
					exact-active-class="selected">Results</router-link>
				<router-link to="/clubs/popular" tag="div" active-class="selected"
					exact-active-class="selected">Popular</router-link>
				<router-link to="/clubs/new_clubs" tag="div" active-class="selected" exact-active-class="selected">New
					Clubs</router-link>
			</nav>
			<div class="club-grid">
				<ClubCard v-for="club in other_clubs" :key="club.club_id" :club="club" />
			</div>
		</div>
	</div>
</template>

<script>
import { onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ClubCard from "../components/ClubCard.vue";
import { useClubStore } from "../stores/clubs";
import { useUserInformation } from "../stores/user";
import { isActive } from "../utils";

export default {
	name: "Clubs",
	components: {
		ClubCard,
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
				await router.push("/clubs/results");
			}
		};

		const unwatch = watch(searchInput, updateRouteAndResults);

		onUnmounted(() => {
			unwatch();
		});

		return {
			searchInput,
		};
	},
	computed: {
		user_clubs() {
			const clubStore = useClubStore();
			const user_id = useUserInformation().getUserID();
			const associations = clubStore.getAssociations(user_id).map((club) => club.club_id);
			return clubStore.getClubsByIDs(associations).filter(isActive);
		},
		other_clubs() {
			const clubStore = useClubStore();
			const user_club_ids = this.user_clubs.map((club) => club.club_id);

			const other_clubs = clubStore.clubs.filter((club) => !user_club_ids.includes(club.club_id)).filter(isActive);

			// filter can be "results", "popular", or "new_clubs"
			switch (this.filter) {
				case "results":
					return other_clubs.filter((club) => club.name.toLowerCase().includes(this.searchInput.trim().toLowerCase()));
				case "popular":
					return other_clubs.sort((a, b) => {
						const a_members = clubStore.getUsersInClub(a.club_id);
						const b_members = clubStore.getUsersInClub(b.club_id);
						return b_members.length - a_members.length;
					});
				case "new_clubs":
					return other_clubs.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
				default:
					return other_clubs;
			}
		},
	},
};
</script>

<style scoped>
.find-clubs-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.your-clubs {
	max-height: 45vh;
	overflow-y: auto;
}

.find-clubs {
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

.club-page {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.club-page>* {
	padding: 20px;
}

.club-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	gap: 20px;
}
</style>
