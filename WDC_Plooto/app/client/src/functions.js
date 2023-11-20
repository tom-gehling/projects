import { useClubStore } from "./stores/clubs";
import { useEventStore } from "./stores/events";
import { usePostStore } from "./stores/posts";
import { useUserInformation } from "./stores/user";
import { isActive, server } from "./utils";

export const removeClubData = (club_id) => {
	// set all posts to status 0
	const postStore = usePostStore();
	postStore.postItems = postStore.postItems.map((post) => {
		if (post.club_id === club_id) {
			return { ...post, status: 0 };
		}
		return post;
	});

	// set all events to status 0
	const eventStore = useEventStore();
	eventStore.events = eventStore.events.map((event) => {
		if (event.club_id === club_id) {
			return { ...event, status: 0 };
		}
		return event;
	});

};

let timelineCache = {
	data: [],
	time: 0
};
let lastFetch = 0;
let lastEvent = 0;

export const resetLastFetch = () => {
	lastFetch = 0;
	lastEvent = 0;
	timelineCache = {
		data: [],
		time: 0
	};
};

export const fetchBasicInformation = async (force = false) => {
	// check if we have already fetched the data
	if (Date.now() - lastFetch < 1000 * 60 * 5 && force === false) {
		return true;
	}

	const response = await server.get("/api/data");
	if (!response.success) return false;

	// update information
	const { events, event_attendance, clubs, posts, club_association, club_requests } = response.data;

	// we will have to update every store in this part
	const eventStore = useEventStore();
	const clubStore = useClubStore();
	const postStore = usePostStore();
	// clear old data
	eventStore.events = [];
	eventStore.event_attendance = [];
	clubStore.clubs = [];
	clubStore.user_clubs = [];
	clubStore.club_requests = [];
	postStore.postItems = [];

	// add new data
	eventStore.addEvents(events);
	eventStore.addEventAttendance(event_attendance);

	clubStore.addClubs(clubs);
	clubStore.addAssociations(club_association);
	clubStore.addClubRequests(club_requests);

	postStore.addPosts(posts);

	lastFetch = Date.now();
	return true;
};


export const fetchTimeline = async () => {
	// check if we have already fetched the data
	if (Date.now() - timelineCache.time < 1000 * 60 * 1) { // 1 minute cache time
		return { success: true, data: timelineCache.data, error: null };
	}

	const response = await server.get("/api/user/timeline");
	if (!response.success) return response;

	const { events, posts, trending, attendance } = response.data;

	// update the stores with the information
	const eventStore = useEventStore();
	eventStore.addEvents(events);
	eventStore.addEvents(trending);
	eventStore.addEventAttendance(attendance);

	const postStore = usePostStore();
	postStore.addPosts(posts);

	// transform posts and events into a single timeline array
	// should be sorted by updated_at date
	// should have additional property "type" to differentiate between events and posts
	const timeline = [...events, ...posts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).map((item) => ({ ...item, type: item.event_id ? "event" : "post" })).filter(isActive);

	timelineCache = {
		data: timeline,
		time: Date.now()
	};

	return { success: true, data: timeline, error: null };
};


export const fetchEvents = async () => {
	// check if we have already fetched the data
	if (Date.now() - lastEvent < 1000 * 60 * 5) {
		return { success: true, data: null, error: null };
	}

	const response = await server.get("/api/event");
	if (!response.success) return response;

	const { events, attendance } = response.data;

	// update the stores with the information
	const eventStore = useEventStore();
	eventStore.addEvents(events);
	eventStore.addEventAttendance(attendance);

	lastEvent = Date.now();

	return { success: true, data: events, error: null };
};

export const fetchEvent = async (event_ids) => {
	const response = await server.post("/api/event", { event_ids });
	if (!response.success) return response;

	const { events } = response.data;

	// update the stores with the information
	const eventStore = useEventStore();
	eventStore.addEvents(events);

	return response;
};

export const fetchClub = async (club_id) => {
	const response = await server.post("/api/club/data", { club_id });
	if (!response.success) return response;

	const { club } = response.data;

	// update the stores with the information
	const clubStore = useClubStore();
	clubStore.addClubs([club]);

	return response;
};

export const fetchPosts = async (post_ids) => {
	const response = await server.post("/api/post/fetch", { post_ids });
	if (!response.success) return response;

	const { posts } = response.data;

	// update the stores with the information
	const postStore = usePostStore();
	postStore.addPosts(posts);

	return response;
};


export const fetchNotifications = async () => {
	const response = await server.get("/api/user/notifications");
	if (!response.success) return response;

	const { notifications } = response.data;

	const userStore = useUserInformation();
	userStore.addNotifications(notifications);

	return { success: true, data: notifications, error: null };
};

export const fetchAdminData = async () => {
	const response = await server.get("/api/admin");
	if (!response.success) return response;

	const { clubs, events, posts, users, clubUsers } = response.data;

	// update the stores with the information
	const eventStore = useEventStore();
	eventStore.addEvents(events);

	const clubStore = useClubStore();
	clubStore.addClubs(clubs);
	clubStore.addAssociations(clubUsers);

	const postStore = usePostStore();
	postStore.addPosts(posts);

	return { success: true, data: { clubs, events, posts, users, clubUsers }, error: null };
};
