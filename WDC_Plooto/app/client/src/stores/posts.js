import { defineStore } from "pinia";
import { server } from "../utils";

/**
 * @typedef {Object} Post
 * @property {string} post_id
 * @property {string} content
 * @property {string} title
 * @property {string} club_id
 * @property {Date} created_at
 * @property {Date} updated_at
 */

export const usePostStore = defineStore({
	id: 'posts',
	state: () => ({
		/** @type {Post[]} */
		postItems: []
	}),
	getters: {
		getPostsByClubIDs: (state) => (clubIDs) => state.postItems.filter((post) => clubIDs.includes(post.club_id))
	},
	actions: {
		addTimelineItem(item) {
			this.postItems.push(item);
		},
		replacePost(item) {
			this.postItems = this.postItems.map((post) => {
				if (post.post_id === item.post_id) {
					return item;
				}
				return post;
			});
		},
		async updatePost(post) {
			const response = await server.put("/api/post/update", post);
			if (!response.success) return response;

			this.replacePost(post);

			return response;
		},
		async createPost(post_data) {
			/** @type {Post} */
			const post = {
				post_id: crypto.randomUUID(),
				...post_data
			};
			const response = await server.post("/api/post/create", post);
			if (!response.success) return response;

			// update store
			this.postItems.push(post);

			return response;
		},
		addPosts(posts) {
			// add posts or update existing ones already in the store
			posts.forEach((post) => {
				const existingPost = this.postItems.find((item) => item.id === post.id);
				if (existingPost) {
					this.replacePost(post);
				} else {
					this.addTimelineItem(post);
				}
			});
		}

	}
});
