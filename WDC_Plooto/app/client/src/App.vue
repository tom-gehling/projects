<template>
	<div id="app-container" :class="{ light: !dark_mode }" v-if="useBaseLayout">
		<Topbar :dark-mode="dark_mode" />
		<div class="main" style="height: calc(100vh - 60px)">
			<Sidebar />
			<Content>
				<router-view />
			</Content>
		</div>
	</div>
	<div id="app-container" :class="{ light: !dark_mode }" v-else class="main" style="height: 100vh">
		<router-view />
	</div>
</template>

<script>
import Content from "./components/Content.vue";
import Sidebar from "./components/Sidebar.vue";
import Topbar from "./components/Topbar.vue";
import { fetchBasicInformation } from "./functions";
import { useDarkMode } from "./stores/dark";
import { useUserInformation } from "./stores/user";

import { useRouter } from "vue-router";

const SKIP_AUTH = ["/login", "/signup"];

export default {
	components: {
		Topbar,
		Sidebar,
		Content,
	},
	setup() {
		const router = useRouter();
		const userStore = useUserInformation();

		router.beforeEach(async (to, from, next) => {
			// if the to is in skip, then skip the auth check
			if (SKIP_AUTH.includes(to.path)) {
				next();
				return;
			}

			const result = await userStore.authCheck();
			if (!result) {
				next("/login");
			} else {
				// fetch basic information but only once every 5 minutes
				await fetchBasicInformation();
				next();
			}
		});
	},
	computed: {
		dark_mode() {
			const mode = useDarkMode();
			return mode.dark_mode;
		},
		useBaseLayout() {
			return this.$route.path !== "/login" && this.$route.path !== "/signup";
		},
	},
	methods: {
		toggleDarkMode() {
			const mode = useDarkMode();
			mode.toggleDarkMode();
		},

	},
};
</script>

<style>
#app {
	overflow: hidden;
}

.main {
	display: flex;
	width: 100vw;
}

.content {
	overflow-y: scroll;
}
</style>
