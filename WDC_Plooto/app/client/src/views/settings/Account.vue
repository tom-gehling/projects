<template>
	<div>
		<!-- big boy -->
		<div class="account-user">
			<!-- image and name div -->
			<div class="user-picture">
				<img :src="user.picture_url" alt="user-picture" />
			</div>
			<div class="user-name">
				<h1>{{ user.first_name }} {{ user.last_name }}</h1>
			</div>
		</div>
		<form class="input-section">
			<!-- settings inputs div -->
			<div class="input-column">
				<!-- left side -->
				<p>First Name</p>
				<input type="text" v-model="user.first_name" placeholder="First Name" />
				<p>Email</p>
				<input type="text" v-model="user.email" placeholder="Email" />
				<p>Picture URL</p>
				<input type="text" v-model="user.picture_url" placeholder="Picture URL" />
			</div>
			<div class="input-column">
				<!-- right side -->
				<p>Last Name</p>
				<input type="text" v-model="user.last_name" placeholder="Last Name" />
				<p>Phone</p>
				<input type="text" v-model="user.phone_number" placeholder="Phone" />
				<p>Date of Birth</p>
				<input type="date" v-model="birth_date" placeholder="Date of Birth" />
			</div>
		</form>
		<div class="save-button-padder">
			<!-- padding at bottom -->
		</div>
		<div style="display: flex; flex-direction: row; gap: 5px; align-items: center; justify-content: center;">
			<button type="submit" class="generic-button" id="save-button" @click="submitUpdate">Save</button>
			<button @click="connectToGithub" type="button" class="github-button generic-button"
				v-if="user.github_id == null">
				<Github :size="18" class="github-icon" />
				<span class="button-text">Connect with GitHub</span>
			</button>
			<button v-else style="color: var(--accent-green);" class="github-button generic-button" disabled>
				<Check :size="18" class="github-icon" />
				<div>Linked to Github</div>
			</button>
		</div>
		<div class="empty-padder">
			<!-- padding at bottom -->
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';
import { useUserInformation } from '../../stores/user';
import { dateToLocalISO } from '../../utils';
import { Github, Check } from "lucide-vue-next";

export default {
	name: "Account",
	components: {
		Github,
		Check
	},

	setup() {
		const user = ref({ ...useUserInformation().getUserInformation() });

		const submitUpdate = async () => {
			const response = await useUserInformation().update(user.value);
			if (!response.success) {
				alert(response.error);
			}
		};

		const connectToGithub = () => {
			window.location.href = 'http://127.0.0.1:8080/auth/github';
		};

		return {
			user,
			submitUpdate,
			connectToGithub,
			birth_date: {
				get() {
					const date = dateToLocalISO(user.value.birth_date);
					return date.slice(0, 10);
				},
				set(value) {
					user.value.birth_date = value;
				}
			},
		};
	},
};
</script>



<style>
.github-button {
	display: flex !important;
	align-items: center;
	justify-content: center;
}

.github-icon {
	margin-right: 10px;
}

.button-text {
	text-align: center;
}

.account-user {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

.user-picture {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100px;
	height: 100px;
	border-radius: 50%;
	overflow: hidden;
	object-fit: contain;
}

.user-picture img {
	max-width: 100%;
	max-height: 100%;
}

.user-name {
	padding-left: 1%;
	color: var(--text-primary);
}

.input-section {
	display: flex;
	flex-direction: row;
	align-content: center;
	justify-content: center;
	gap: 100px;
}

.input-column {
	display: flex;
	flex-direction: column;
	width: 30%;
}

.input-column input {
	width: 100%;
}

.input-column p {
	color: var(--text-tertiary);
	padding-top: 20px;
}

.empty-padder {
	display: flex;
	padding: 5px;
}

.save-button-padder {
	display: flex;
	padding-top: 20px;
}
</style>



