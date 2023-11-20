<template>
	<div class="home-container">
		<div v-if="loading" style="width: 100%">
			<p>Loading...</p>
		</div>
		<div v-else id="home-timeline">
			<TimelineItem v-for="item in timeline" :post="item" :key="item.id" />
		</div>
		<aside id="home-sidebar" class="bg-primary">
			<div class="sidebar-section">
				<h3>calendar</h3>
				<div class="sidebar-box bg-secondary">
					<Calendar :attributes="attributes" trim-weeks expanded color="plooto">
						<template #day-popover="{ dayTitle, attributes }">
							<div class="cal-popup">
								<div class="popup-date">
									{{ dayTitle }}
								</div>
								<div v-for="{ key, customData } in attributes" :key="key">
									<router-link :to="`/event/${customData.event_id}`">{{ customData.title }}</router-link>
								</div>
							</div>
						</template>
					</Calendar>
				</div>
			</div>
			<div class="sidebar-section">
				<h3>trending events</h3>
				<div class="sidebar-box bg-secondary">
					<div v-for="event in top_events" :key="event.event_id">
						<div class="each-event">
							<div class="title-and-date">
								<p><router-link :to="`/event/${event.event_id}`" style="font-weight: bolder;">{{ event.title
								}}</router-link></p>
								<span style="font-size: small;">{{ event.formatted_date }}</span>
							</div>
							<div class="attending">
								<Flame :size="16" />
								<p style="white-space: nowrap;">{{ event.attending }} </p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</aside>
	</div>
</template>

<script>
import { Flame } from "lucide-vue-next";
import moment from "moment";
import { Calendar } from "v-calendar";
import "v-calendar/style.css";
import { onMounted, ref } from "vue";
import { fetchTimeline } from "../functions";
import { useEventStore } from '../stores/events';
import { usePostStore } from "../stores/posts";
import { useUserInformation } from "../stores/user";
import { isActive } from "../utils";
import TimelineItem from "/src/components/TimelineItem.vue";

export default {
	name: "Home",
	components: {
		Calendar,
		TimelineItem,
		Flame
	},
	setup() {
		const timeline = ref([]);
		const loading = ref(true); // Reactive reference for loading state

		onMounted(async () => { // Use async operation inside onMounted
			const result = await fetchTimeline();
			timeline.value = result?.data ?? [];
			loading.value = false;
		});

		return {
			timeline,
			loading, // Expose loading to the template
		};
	},
	computed: {
		attributes() {
			return [
				...this.user_events.map(todo => ({
					dates: todo.start_time,
					dot: true,
					popover: true,
					customData: todo,
				})),
				{
					key: "today",
					highlight: {
						fillMode: 'outline',
					},
					dates: new Date(),
				},
			];
		},
		top_events() {
			const eventStore = useEventStore();
			const top_events = eventStore.getPopularEvents(10); // get top 10
			return top_events.map((event => {
				const attendees = eventStore.getAttendees(event.event_id);
				const sum_attendance = attendees.going.length + attendees.interested.length;
				return {
					...event,
					attending: sum_attendance,
					formatted_date: moment(event.start_time).calendar({ sameElse: 'ha [on] MMM Do' }),
				};
			}));
		},
		user_events() {
			const eventStore = useEventStore();
			const user_id = useUserInformation().getUserID();

			const events = eventStore
				.getEventsByUserID(user_id)
				.filter((assoc) => assoc.rsvp != "none")
				.map((assoc) => ({ ...eventStore.getEventByID(assoc.event_id), rsvp: assoc.rsvp }))
				.filter(isActive);
			return events;
		},
		sorted_items() {
			const post_items = usePostStore().postItems;
			return post_items.sort((a, b) => {
				return b.post_date - a.post_date;
			});
		},
	},
};
</script>


<style>
/* if we want the padding and stuff around calendar
.calendar {
	width: 100%;
	height: 100%;
	padding: 20px;
}
*/

.cal-popup {
	text-align: center;
	font-size: small;
}

.popup-date {
	font-weight: 600;
}

.home-container {
	display: flex;
	flex-direction: row;
	gap: 20px;
	width: 100%;
}

.sidebar-box {
	border-radius: var(--normal-border-radius);
	height: auto;
	padding: 10px;
	color: var(--text-primary);
}

.each-event {
	padding-bottom: 20px;
	display: flex;
	flex-direction: row;
	width: 100%;
}

div.title-and-date {
	text-align: left;
	width: 100%;
}

div.attending {
	display: flex;
	align-items: center;
	padding-right: 10px;
}

.sidebar-section {
	padding-top: 20px;
}

#home-timeline {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

#home-timeline>div {
	border-radius: var(--normal-border-radius);
	padding: 20px;
}

#home-sidebar {
	border-radius: var(--normal-border-radius);
	padding: 20px;
	padding-top: 0px;
	width: 400px;
}

#home-sidebar h3 {
	text-align: center;
	color: var(--text-primary);
}
</style>