<template>
	<div class="page">
		<div class="login">
			<h1>plooto</h1>
			<form>
				<h2>Login</h2>
				<label for="email">Email</label>
				<input ref="emailInput" v-model="email" type="email" name="email" id="email" @input="hideAlert" />
				<label for="password">Password</label>
				<input v-model="password" type="password" name="password" id="password" @input="hideAlert" />
				<p :style="{ opacity: showAlert ? 1 : 0 }" class="alert">Invalid Email or Password</p>
				<button type="button" class="login-buttons" @click="login">Sign In</button>
				<button type="button" class="github-button" @click="loginWithGithub">
					<Github />
					Sign In with GitHub
				</button>
			</form>
			<!-- use style binding to control the opacity of the alert message -->
			<p style="text-align: center">Or</p>
			<router-link to="/signup">
				<button type="button">Create Account</button>
			</router-link>
		</div>
	</div>
</template>

<script>
import { Github } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserInformation } from "../stores/user";

export default {
	name: "Login",

	components: {
		Github,
	},

	setup() {
		const email = ref("");
		const password = ref("");
		const userStore = useUserInformation();
		const router = useRouter();
		const alertMessage = ref("");
		const showAlert = ref(false);
		const emailInput = ref(null);

		const login = async () => {
			const result = await userStore.login(email.value, password.value);
			if (result === true) {
				router.push("/");
			} else {
				showAlert.value = true;
				password.value = "";
				emailInput.value.focus();
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
			}
		};

		const hideAlert = () => {
			showAlert.value = false;
		};

		const loginWithGithub = () => {
			window.location.href = 'http://127.0.0.1:8080/auth/github';
		};

		return {
			email,
			password,
			login,
			alertMessage,
			showAlert,
			hideAlert,
			emailInput,
			loginWithGithub,
		};
	},
};
</script>
<style scoped>
.github-button {
	display: flex;
	align-items: center;
	justify-content: center;
}

.github-button svg {
	margin-right: 10px;
}

.alert {
	color: #e58686;
	font-size: medium;
	font-weight: semibold;
	text-align: center;
	transition: opacity 0.5s ease;
}

.page {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	flex-direction: column;
}

input {
	width: 100%;
	font-size: large;
	padding: 10px;
}

label,
p {
	font-size: small;
	color: var(--text-tertiary);
}

.login {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: min(400px, 90%);
}

form {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

h1 {
	color: var(--text-primary);
	position: absolute;
	width: 100%;
	top: -20vmin;
	font-size: 8vmin;
	text-align: center;
}

h2 {
	text-align: center;
	color: var(--text-secondary);
}

button {
	background-color: var(--accent-primary);
	border-radius: 5px;
	border: none;
	font-weight: bolder;
	font-size: medium;
	cursor: pointer;
	margin: 20px 0px;
	width: 100%;
	height: 50px;
}
</style>
