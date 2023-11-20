<template>
	<div class="notification-settings">
		<div class="description">Manage what emails you want to receive</div>
		<div v-if="loading">
			Loading...
		</div>

		<div v-else class="notification-settings-form">
			<!-- General Settings -->
			<div class="settings-section shadow-sm rounded-normal">
				<h2>General</h2>
				<div v-for="(value, key) in settings.general" :key="key">
					<label :for="key">{{ key.replaceAll('_', ' ') }}</label>
					<input type="checkbox" :id="key" v-model="settings.general[key]" />
				</div>
			</div>

			<!-- Club Settings -->
			<div class="settings-section shadow-sm rounded-normal club-section">
				<h2>Club Settings</h2>
				<div v-for="(club, club_id) in settings.clubs" :key="'club-' + club_id">
					<h3>Club {{ getClubName(club_id) }}</h3>
					<div v-for="(value, key) in club" :key="key">
						<label :for="'club-' + club_id + '-' + key">{{ key.replaceAll('_', ' ') }}</label>
						<input type="checkbox" :id="'club-' + club_id + '-' + key" v-model="club[key]" />
					</div>
				</div>
			</div>

			<!-- Admin Settings -->
			<div class="settings-section shadow-sm rounded-normal club-section">
				<h2>Admin Settings</h2>
				<div v-for="(club, club_id) in settings.admin" :key="'admin-' + club_id">
					<h3>Club {{ getClubName(club_id) }}</h3>
					<div v-for="(value, key) in club" :key="key">
						<label :for="'admin-' + club_id + '-' + key">{{ key.replaceAll('_', ' ') }}</label>
						<input type="checkbox" :id="'admin-' + club_id + '-' + key" v-model="club[key]" />
					</div>
				</div>
			</div>

			<!-- Update Button -->
			<div>
				<button class="generic-button shadow-sm" style="margin:auto;" @click="saveSettings">Save</button>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, onMounted } from "vue";
import { server } from "../../utils"; // Make sure to install and import axios
import { useClubStore } from "../../stores/clubs";

export default {
	name: "NotificationSettings",
	setup() {
		const settings = ref({});
		const loading = ref(true);

		const fetchSettings = async () => {
			try {
				const response = await server.get("/api/user/emails/settings");
				settings.value = response.data.settings;
				loading.value = false;
			} catch (error) {
				console.error(error);
			}
		};

		const saveSettings = async () => {
			try {
				await server.post('/api/user/emails/settings', {
					settings: settings.value,
				});
				alert('Settings updated successfully');
			} catch (error) {
				console.error(error);
				alert('Failed to update settings');
			}
		};

		onMounted(fetchSettings);

		return {
			settings,
			loading,
			saveSettings
		};
	},
	methods: {
		getClubName(club_id) {
			const clubStore = useClubStore();
			return clubStore.getClubByID(club_id)?.name;
		}
	}

};
</script>

<style scoped>
.description {
	margin-bottom: 20px;
	text-align: center;
}

.notification-settings {
	width: 80%;
	max-width: 800px;
	margin: auto;
	padding: 20px;
	color: var(--text-secondary);
}

h2,
h3 {
	color: var(--text-primary);
}

.settings-section {
	background-color: var(--bg-secondary);
	padding: 10px 20px;
}

.settings-section h2 {
	text-align: center;
}

.settings-section input {
	width: unset;
}

/* each div under settings-section but not the first one has margin-top */
.club-section>div:not(:first-child) {
	margin-top: 20px;
}

.notification-settings-form {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.notification-settings-form label {
	color: var(--text-primary);
	margin-bottom: 5px;
}

.notification-settings-form input,
.notification-settings-form select {
	margin-bottom: 15px;
}

label {
	text-transform: capitalize;
}
</style>