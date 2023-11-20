<template>
	<div class="page">
		<router-link to="/login" class="back-to-login">
			<ArrowLeft :size="24" />
			<span>Back to Login</span>
		</router-link>
		<div class="signup">
			<h1>plooto</h1>
			<form>
				<h2>Create Account</h2>
				<div class="name-inputs">
					<div>
						<label for="first-name">First Name</label>
						<input type="text" name="first-name" id="first-name" v-model="firstName" />
					</div>
					<div>
						<label for="last-name">Last Name</label>
						<input type="text" name="last-name" id="last-name" v-model="lastName" />
					</div>
				</div>
				<label for="email">Email</label>
				<input type="email" name="email" id="email" v-model="email" />
				<label for="password">Password</label>
				<input type="password" name="password" id="password" v-model="password" />
				<label for="confirm-password">Confirm Password</label>
				<input type="password" name="confirm-password" id="confirm-password" v-model="confirmPassword" />
				<p :style="{ opacity: showAlert ? 1 : 0 }" class="alert">{{ alertText }}</p>
				<button type="button" @click="signup">Sign Up</button>
			</form>
		</div>
	</div>
</template>

<script>
import { ArrowLeft } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserInformation } from "../stores/user";

export default {
	name: "CreateAccount",
	components: {
		ArrowLeft,
	},
	setup() {
		const userStore = useUserInformation();
		const firstName = ref("");
		const lastName = ref("");
		const email = ref("");
		const password = ref("");
		const confirmPassword = ref("");
		const router = useRouter();
		const showAlert = ref(false);
		const alertText = ref("");
		const signup = async () => {
			if (firstName.value.length == 0) {
				alertText.value = "First Name Is Required!";
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
			if (lastName.value.length == 0) {
				alertText.value = "Last Name Is Required!";
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
			if (email.value.length == 0 || email.value.includes("@") !== true) {
				alertText.value = "Email Is Not Valid!";
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
			if (password.value !== confirmPassword.value) {
				alertText.value = "Passwords Do Not Match!";
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
			if (password.value.length < 6) {
				alertText.value = "Passwords Is Not Long Enough!";
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
			const { success, error } = await userStore.create({
				first_name: firstName.value,
				last_name: lastName.value,
				email: email.value,
				password: password.value,
			});
			if (success === true) {
				router.push("/");
			} else {
				alertText.value = error;
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
		};

		return {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			signup,
			showAlert,
			alertText
		};
	},
};
</script>

<style scoped>
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

.signup {
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
	padding: 15px 0px;
	font-weight: bolder;
	font-size: medium;
	cursor: pointer;
	margin: 20px 0px;
	width: 100%;
}

.back-to-login {
	position: absolute;
	top: 10px;
	left: 10px;
	color: var(--text-tertiary);
	text-decoration: none;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 5px;
}

.back-to-login span {
	color: var(--text-secondary);
}
</style>
