<template>
	<div class="club-posts-container">
		<div class="search-bar">
			<input type="text" v-model="searchQuery" placeholder="Search Posts..." />
			<button class="create-post-button generic-button shadow-sm" style="border: none" @click="createPost">Make
				Post</button>
		</div>
		<div class="post-container">
			<div v-for="post in filteredPosts" :key="post.id" class="post-row bg-secondary rounded-normal shadow-sm">
				<div class="post-row-info">
					<div style="display: flex; flex-direction: row; align-items: center; gap: 5px;">
						<h4>{{ post.title }}</h4>
						<p v-if="post.status != 1">(deleted)</p>
					</div>
					<div>Posted {{ formatDate(post.post_date) }}</div>
				</div>
				<div class="post-row-buttons">
					<button class="generic-button shadow-sm" @click.stop="editPost(post)">Edit</button>
					<button v-if="post.status == 1" class="generic-button shadow-sm"
						@click.stop="removePost(post)">Remove</button>
					<button v-else class="generic-button shadow-sm" @click.stop="restorePost(post)">Restore</button>
				</div>
			</div>
		</div>
		<dialog id="postEditor" class="dialog">
			<PostEditor :post="selectedPost" v-if="showEditor" @close="closeDialog" @update="updatePost"
				:mode="selectedPost ? 'edit' : 'create'" />
		</dialog>
	</div>
</template>

<script>
import moment from "moment";
import PostEditor from "../../components/PostEditor.vue";
import { usePostStore } from "../../stores/posts";
export default {
	name: "Posts",
	props: {
		club_id: {
			type: String,
			required: false,
		},
	},
	components: {
		PostEditor,
	},

	data() {
		return {
			selectedPost: null,
			showEditor: false,
			searchQuery: '',
		};
	},
	computed: {
		club_posts() {
			const postStore = usePostStore();
			return postStore.getPostsByClubIDs([this.club_id]);
		},
		filteredPosts() {
			if (!this.searchQuery) {
				return this.club_posts;
			}

			const search = this.searchQuery.toLowerCase();
			return this.club_posts.filter(post => post.title && post.title.toLowerCase().includes(search));
		},
	},
	methods: {
		editPost(post) {
			this.selectedPost = post;
			this.openDialog();
		},
		async removePost(post) {
			const postStore = usePostStore();
			const result = await postStore.updatePost({ ...post, status: 0 });
			if (!result.success) {
				alert(result.error);
				return;
			}
		},
		async restorePost(post) {
			const postStore = usePostStore();
			const result = await postStore.updatePost({ ...post, status: 1 });
			if (!result.success) {
				alert(result.error);
				return;
			}
		},
		createPost() {
			this.selectedPost = null;
			this.openDialog();
		},
		closeDialog() {
			const dialog = document.getElementById("postEditor");
			dialog.close();
			this.showEditor = false;
		},
		openDialog() {
			const dialog = document.getElementById("postEditor");
			dialog.showModal();
			this.showEditor = true;
		},
		async updatePost(post) {
			const postStore = usePostStore();
			let result = null;
			if (this.selectedPost) {
				result = await postStore.updatePost(post);
			} else {
				result = await postStore.createPost({ ...post, club_id: this.club_id });
			}
			if (!result.success) {
				alert(result.error);
				return;
			}
			this.closeDialog();
		},
		formatDate(date) {
			return moment(date).fromNow();
		},

	},
};
</script>

<style scoped>
.post-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.club-posts-container {
	color: var(--text-primary);
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.post-row {
	display: flex;
	flex-direction: row;
	gap: 10px;
	padding: 10px 20px;
	align-items: center;
	justify-content: center;
}

.post-row-buttons {
	display: flex;
	gap: 5px;
}

.post-row-info {
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-between;
}

.search-bar {
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
}

.create-post-button {
	margin-left: auto;
}

.dialog {
	width: min(80%, 1200px);
}
</style>
