<template>
	<header class="topbar bg-primary">
		<div class="plooto">plooto</div>
		<router-link to="/notifications" class="topbar-button shadow-sm" :class="{ selected: route.path.startsWith('/notifications') }">
			<Bell :size="16" />
		</router-link>
		<router-link to="/settings" class="topbar-button shadow-sm" :class="{ selected: route.path.startsWith('/settings') }">
			<Settings :size="16" />
		</router-link>
		<button class="topbar-button shadow-sm" @click="toggleDarkMode">
			<Moon :size="16" />
		</button>
		<ProfileBar />
		<div></div>
	</header>
</template>

<script>
import { Settings, Bell, Moon } from "lucide-vue-next";
import ProfileBar from "./ProfileBar.vue";
import { useRoute } from "vue-router";
import { useDarkMode } from "../stores/dark";

export default {
	name: "Topbar",
	components: {
		Settings,
		Bell,
		Moon,
		ProfileBar,
	},

	setup() {
		const route = useRoute();
		return {
			route,
		};
	},
	methods: {
		toggleDarkMode() {
			const mode = useDarkMode();
			mode.toggleDarkMode();
		},
	},
};
</script>

<style scoped>
header {
	position: relative;
}

.plooto {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 9%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: xx-large;
	font-weight: bold;
	color: var(--text-primary);
}

.topbar {
	padding-right: 2px;
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	align-items: center;
	width: 100%;
	height: 60px;
}

.topbar-button {
	background-color: var(--bg-secondary);
	border-radius: var(--normal-border-radius);
	padding: 0px 10px;
	height: 30px;
	border: none;
	color: var(--text-tertiary);
	cursor: pointer;

	display: flex;
	justify-content: center;
	align-items: center;
}

.topbar-button.selected {
	background-color: var(--bg-tertiary);
	color: var(--accent-primary);
}

.topbar-button:hover {
	background-color: var(--bg-tertiary);
}
</style>
