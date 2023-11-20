<template>
	<div style="position: relative">
		<div class="profile-bar shadow-sm" @click.stop="open">
			<div>{{ name }}</div>
			<img :src="information?.picture_url" class="user-icon" />
		</div>
		<dialog id="profileDialog" class="dialog shadow-md">
			<div class="dialog-content" @click.stop>
				<router-link to="/login">
					<button @click="logout">Logout</button>
				</router-link>
			</div>
		</dialog>
	</div>
</template>

<script>
import { useUserInformation } from "../stores/user";
import { resetLastFetch } from "../functions";

export default {
	name: "ProfileBar",

	computed: {
		information() {
			return useUserInformation().getUserInformation();
		},
		name() {
			return useUserInformation().getName();
		},
	},
	methods: {
		open() {
			const profileDialog = document.getElementById("profileDialog");
			profileDialog.show();
		},
		closeDialog() {
			const profileDialog = document.getElementById("profileDialog");
			profileDialog.close();
		},
		logout() {
			// Implement your logout logic here
			const userInformation = useUserInformation();
			userInformation.setUserInformation(null);

			resetLastFetch();

			const profileDialog = document.getElementById("profileDialog");
			profileDialog.close();
		},
		handleKeydown(e) {
			const profileDialog = document.getElementById("profileDialog");
			if (e.key === "Escape" && profileDialog?.open) {
				this.closeDialog();
			}
		},
		handleClick(e) {
			const profileDialog = document.getElementById("profileDialog");
			if (profileDialog?.open && !profileDialog.contains(e.target)) {
				this.closeDialog();
			}
		},
	},
	mounted() {
		document.addEventListener("keydown", (e) => this.handleKeydown(e));
		document.addEventListener("click", (e) => this.handleClick(e));
	},
};
</script>

<style scoped>
.profile-bar {
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 5px 15px;
	border-radius: var(--normal-border-radius);
	color: var(--text-primary);
	font-weight: 550;
}

.profile-bar:hover {
	background-color: var(--bg-secondary);
}

.user-icon {
	width: 36px;
	border-radius: var(--normal-border-radius);
	margin-left: 5px;
}

.dialog {
	margin-top: 5px;
	padding: 15px;
	width: 100%;
}

.dialog-content {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

button {
	background-color: var(--accent-primary);
	border-radius: 5px;
	border: none;
	padding: 10px;
	font-weight: bolder;
	font-size: medium;
	cursor: pointer;
	width: 100%;
}
</style>
