<template>
	<form @submit.prevent="submitUpdate">
		<label for="name">Club Name</label>
		<input id="name" v-model="localClub.name" type="text" required />

		<label for="description">Description</label>
		<textarea id="description" v-model="localClub.description" required></textarea>

		<label for="private" class="checkbox-container">
			Private
			<input type="checkbox" id="private" v-model="private" />
			<span class="checkmark"></span>
		</label>

		<button type="submit" class="generic-button">{{ title }}</button>
		<button type="button" class="generic-button" @click="$emit('close')">Close</button>
	</form>
</template>

<script>
export default {
	props: {
		club: {
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
			localClub: null,
		};
	},
	created() {
		this.localClub = this.club ? JSON.parse(JSON.stringify(this.club)) : this.createNewClub();
	},
	methods: {
		createNewClub() {
			return {
				name: "",
				description: "",
				private: 0,
			};
		},
		submitUpdate() {
			this.$emit("update", this.localClub);
		},
	},
	computed: {
		title() {
			return this.mode === "create" ? "Create Club" : "Update Club";
		},
		private: {
			get() {
				return this.localClub.private == 1;
			},
			set(value) {
				this.localClub.private = value ? 1 : 0;
			},
		}
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
