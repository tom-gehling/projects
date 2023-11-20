<template>
	<div v-if="notifications.length == 0">
		<span style="display: flex; justify-content: center;">
			No notifications!
		</span>
	</div>
	<div v-else class="notification-container">
		<NotificationCard v-for="notification in notifications" :key="notification.id" :notification="notification" />
	</div>
</template>

<script>
import NotificationCard from "../components/NotificationCard.vue";
import { useUserInformation } from "../stores/user";
import { fetchNotifications } from "../functions";

export default {
	name: "Notifications",
	components: {
		NotificationCard,
	},
	setup() {
		fetchNotifications();
	},
	computed: {
		notifications() {
			return useUserInformation().notifications.sort((a, b) => a.created_at < b.created_at ? 1 : -1);
		}
	}
};
</script>

<style scoped>
.notification-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
}
</style>
