<template>
	<div class="container">
		<nav>
			<h3>Settings</h3>
			<router-link to="/settings/account" active-class="selected" exact-active-class="selected">Account</router-link>
			<router-link to="/settings/notifications" active-class="selected" exact-active-class="selected">Notifications</router-link>
			<router-link to="/settings/admin" active-class="selected" exact-active-class="selected" v-if="user.system_admin">Admin</router-link>
		</nav>
		<div class="settings-content">
			<router-view />
		</div>
	</div>
</template>

<script>
import { useUserInformation } from "../stores/user";

export default {
	name: "Settings",
	setup() {
		const user = useUserInformation().getUserInformation();

		return {
			user,
		};
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
