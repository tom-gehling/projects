<template>
	<div>
		<form @submit.prevent="saveEvent">
			<div>
				<label for="name">Name:</label>
				<input id="name" type="text" v-model="localEvent.title" required />
			</div>
			<div>
				<label for="start-time">Start Time:</label>
				<input id="start-time" type="datetime-local" v-model="start_time" required />
			</div>
			<div>
				<label for="end-time">End Time:</label>
				<input id="end-time" type="datetime-local" v-model="end_time" required />
			</div>
			<div>
				<label for="description">Description:</label>
				<textarea id="description" v-model="localEvent.description" required></textarea>
			</div>
			<div class="checkbox-container" style="justify-content: center; align-items: center">
				<button class="generic-button shadow-sm" type="submit" ev>Save</button>
				<button class="generic-button shadow-sm" type="button" @click="deleteEvent">Delete</button>
				<button class="generic-button shadow-sm" type="button" @click="cancel">Cancel</button>
				<p :style="{ opacity: showAlert ? 1 : 0 }" class="alert">{{ alertText }}</p>
			</div>
		</form>
	</div>
</template>

<script>
import { dateToLocalISO } from "../utils";

export default {
	name: "EventEditor",
	props: {
		event: {
			type: Object,
			required: true,
		},
		mode: {
			type: String,
			required: true,
			validator: (value) => ["create", "edit"].includes(value),
		},
	},
	data() {
		return {
			showAlert: false,
			alertText: false,
			localEvent: null,
		};
	},
	created() {
		this.localEvent = this.event ? JSON.parse(JSON.stringify(this.event)) : this.createNewEvent();
	},
	computed: {
		start_time: {
			get() {
				return dateToLocalISO(this.localEvent.start_time);
			},
			set(value) {
				this.localEvent.start_time = value;
			},
		},
		end_time: {
			get() {
				return dateToLocalISO(this.localEvent.end_time);
			},
			set(value) {
				this.localEvent.end_time = value;
			},
		},
	},
	methods: {
		createNewEvent() {
			return {
				title: "",
				start_time: new Date(),
				// set to + 1 hour by default
				end_time: new Date(Date.now() + 60 * 60 * 1000),
				description: "",
				privacy: "public",
				location: { lat: null, lng: null },
				status: 1,
			};
		},
		saveEvent() {
			if (this.localEvent.title.length == 0) {
				alertText.value = "Club Name Is Not Valid!";
				showAlert.value = true;
				setTimeout(() => {
					showAlert.value = false;
				}, 5000);
				return;
			}
			if (this.mode === "create") {
				this.$emit("create", this.localEvent);
			} else if (this.mode === "edit") {
				this.submitUpdate();
			}
		},
		submitUpdate() {
			this.$emit("update", this.localEvent);
		},
		deleteEvent() {
			this.$emit("update", { ...this.localEvent, status: 0 });
		},
		cancel() {
			this.$emit("close");
		},
	},
};
</script>

<style scoped>
.checkbox-container {
	display: flex;
	flex-direction: row;
	gap: 10px;
}

form {
	display: flex;
	flex-direction: column;
	gap: 10px;
	color: var(--text-primary);
}

input,
textarea {
	width: 100%;
}

textarea {
	height: 20em;
}
</style>
