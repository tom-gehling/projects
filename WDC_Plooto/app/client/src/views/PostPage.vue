<template>
	<div v-if="loading" class="loading">
		Loading...
	</div>
	<div v-else class="post-container bg-secondary shadow-sm">
		<div v-if="error.code" class="error">
			{{ error.code }}: {{ error.message }}
		</div>
		<div v-else class="post-details">
			<h1 class="post-title">{{ post.title }}</h1>
			<h3 class="club-name">{{ club.name }}</h3>
			<p class="post-timestamp">Created at: {{ new Date(post.created_at).toLocaleString() }}</p>
			<p v-if="updated" class="post-timestamp">Updated at: {{ new Date(post.updated_at).toLocaleString() }}</p>
			<p class="post-content">{{ post.content }}</p>
		</div>
	</div>
</template>

<script>
import { ref } from "vue";
import { fetchPosts } from "../functions";
import { useClubStore } from "../stores/clubs";

export default {
	name: "EventPage",
	props: {
		post_id: {
			type: String,
			required: true
		}
	},
	setup() {
		const data = ref(null);
		const loading = ref(true);
		const error = ref({ code: null, message: null });

		return {
			data,
			loading,
			error
		};
	},
	mounted() {
		// fetch the event from event_id
		fetchPosts([this.post_id]).then((result) => {
			this.loading = false;
			if (result.success) {
				this.data = result.data;
			} else {
				this.error.code = result.code;
				this.error.message = result.error;
			}
		});
	},
	computed: {
		post() {
			return this.data?.posts?.[0];
		},
		club() {
			const clubStore = useClubStore();
			return clubStore.getClubByID(this.post.club_id);
		},
		updated() {
			if (this.post.created_at != this.post.updated_at) {
				return true;
			} else {
				return false;
			}
		}
	}

};
</script>

<style scoped>
.loading {
	text-align: center;
	padding: 2em;
}

.error {
	color: red;
	padding: 2em;
}

.post-container {
	padding: 2em;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-details {
	margin-bottom: 2em;
}

h3,
h1 {
	color: var(--text-primary);
}

.post-content {
	font-size: 1.1em;
	line-height: 1.5em;
	color: var(--text-secondary);
}

.post-timestamp {
	font-size: 0.8em;
	color: var(--text-tertiary);
	margin-top: 0.5em;
	margin-bottom: 1em;
}
</style>