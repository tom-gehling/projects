<template>
	<form @submit.prevent="submitUpdate">
		<label for="title">Title</label>
		<input id="title" v-model="localPost.title" type="text" required />

		<label for="content">Content</label>
		<textarea id="content" v-model="localPost.content" required></textarea>

		<label for="private" class="checkbox-container">
			Private
			<input type="checkbox" id="private" v-model="localPost.private" />
			<span class="checkmark"></span>
		</label>

		<button type="submit" class="generic-button">{{ title }}</button>
		<button type="button" class="generic-button" @click="$emit('close')">Close</button>
	</form>
</template>

<script>
export default {
	props: {
		post: {
			type: Object,
			required: true,
		},
		mode: {
			type: String,
			required: true,
			validator: (value) => ["create", "edit"].includes(value),
		},
	},
	computed: {
		title() {
			return this.mode === "create" ? "Create Post" : "Update Post";
		},
	},
	data() {
		return {
			localPost: null,
		};
	},
	created() {
		this.localPost = this.post ? JSON.parse(JSON.stringify(this.post)) : this.createNewPost();
	},
	methods: {
		createNewPost() {
			return {
				title: "",
				content: "",
				private: false,
				event_id: null,
				status: 1,
			};
		},
		submitUpdate() {
			this.$emit("update", this.localPost);
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
