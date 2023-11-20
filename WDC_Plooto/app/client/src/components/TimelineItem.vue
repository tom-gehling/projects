<template>
	<div v-if="post.type == 'event'" class="bg-primary rounded-normal shadow-md">
		<EventCard :event="post" />
	</div>
	<div v-else class="timeline-item-content bg-primary rounded-normal shadow-md">
		<div class="timeline-header rounded-normal bg-secondary shadow-sm">
			<div class="club-picture shadow-xs">
				<img src="https://picsum.photos/200/300" alt="profile picture" />
			</div>
			<div class="timeline-header-info">
				<router-link :to="`/post/${post.post_id}`">
					<div class="post-title">{{ post.title }}</div>
				</router-link>
				<div style="display: flex; gap: 5px">
					<span style="opacity: 75%">{{ club?.name }}</span>
					<span style="opacity: 50%">{{ times }}</span>
				</div>
			</div>
		</div>
		<p>{{ content }}</p>
	</div>
</template>

<script>
import moment from "moment";
import EventCard from "../components/EventCard.vue";
import { useClubStore } from "../stores/clubs";

export default {
	name: "TimelineItem",
	components: {
		EventCard,
	},
	props: {
		post: {
			type: Object,
			required: true,
		},
	},
	computed: {
		formatted_time() {
			return moment(this.post.created_at).fromNow();
		},
		updated_time() {
			return moment(this.post.updated_at).fromNow();
		},
		times() {
			if (this.post.created_at != this.post.updated_at) {
				return `${this.formatted_time} (Updated ${this.updated_time})`;
			}
			return this.formatted_time;
		},
		club() {
			const clubStore = useClubStore();
			return clubStore.getClubByID(this.post.club_id);
		},
		content() {
			return this.post.type == "post" ? this.post.content : this.post.description;
		}
	},
};
</script>

<style scoped>
.post-title {
	font-size: 1.5rem;
	font-weight: bold;
}

.timeline-header {
	/* background-color: #332A46; */
	padding: 5px;
	display: flex;
	flex-direction: row;
	gap: 5px;
}

.timeline-header-info {
	display: flex;
	flex-direction: column;
	justify-content: center;
	color: var(--text-primary);
}

.club-picture {
	width: 75px;
	height: 75px;
	border-radius: 50%;
	overflow: hidden;
	scale: 0.85;
}

.club-picture img {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: fill;
}

.timeline-item-content {
	padding: 20px;
	margin-bottom: 10px;
}

.circle {
	display: inline-block;
	background-color: #3a2f4d;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	margin-left: 10px;
}

p {
	color: var(--text-primary);
	margin: 10px 0px;
}
</style>
