<template>
	<div style="display: flex; flex-direction: row;">
		<div style="display: flex; justify-content: center; padding-right: 20px; align-items: center;">
			<div class="notification-status">
				<!-- status colour -->
			</div>
		</div>
		<div class="bg-primary rounded-normal notification-card">
			<div class="bg-secondary rounded-normal" style="display:flex">
				<div class="club-picture shadow-xs">
					<img src="https://picsum.photos/200/300" alt="profile picture" style="float:left" />
				</div>
				<div class="centered-text">
					<h3>{{ notification.title }}</h3>
					<p>Created {{ created_at }}</p>
				</div>
				<div class="notification-body">
					<p>{{ notification.description }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import moment from "moment";

export default {
	name: "NotificationCard",
	props: {
		notification: {
			type: Object,
			required: true,
		},
	},
	computed: {
		created_at() {
			return moment(this.notification.created_at).calendar();
		},
	}
};
</script>

<style scoped>
.notification-card {
	padding: 20px;
	display: flex;
	flex-direction: column;
	color: var(--text-primary);
	width: 100%;
}

.club-picture {
	width: 75px;
	height: 75px;
	border-radius: 50%;
	overflow: hidden;
	scale: 0.85;
	flex-shrink: 0;
}

.notification-status {
	width: 25px;
	height: 25px;
	border-radius: 50%;
	overflow: hidden;
	background-color: var(--accent-primary);
}

.centered-text {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.notification-body {
	display: flex;
	overflow: hidden;
	flex-direction: column;
	justify-content: center;
	padding-left: 150px;
	padding-right: 150px;
}
</style>
