import { createRouter, createWebHistory } from 'vue-router';
import ClubAdmin from "../views/ClubAdmin.vue";
import Clubs from '../views/Clubs.vue';
import EventPage from "../views/EventPage.vue";
import Events from '../views/Events.vue';
import Home from '../views/Home.vue';
import Login from "../views/Login.vue";
import Notifications from "../views/Notifications.vue";
import PostPage from "../views/PostPage.vue";
import Settings from "../views/Settings.vue";
import Signup from "../views/Signup.vue";
import ClubEvents from "../views/club-admin/ClubEvents.vue";
import Information from "../views/club-admin/Information.vue";
import Members from "../views/club-admin/Members.vue";
import Posts from "../views/club-admin/Posts.vue";
import Account from "../views/settings/Account.vue";
import Admin from "../views/settings/Admin.vue";
import NotificationSettings from "../views/settings/Notifications.vue";
import ClubPage from "../views/ClubPage.vue";


const routes = [
	{ path: '/', component: Home },
	{ path: '/signup', component: Signup },
	{ path: '/login', component: Login },
	{ path: '/post/:post_id', component: PostPage, props: true },
	{ path: '/event/:event_id', component: EventPage, props: true },
	{ path: '/club/:club_id', component: ClubPage, props: true },
	{ path: '/events', component: Events },
	{ path: '/events/:filter', component: Events, props: true },
	{ path: '/clubs', component: Clubs },
	{ path: '/clubs/:filter', component: Clubs, props: true },
	{
		path: '/settings',
		component: Settings,
		props: true,
		children: [
			{ path: '', redirect: '/settings/account' },
			{ path: 'account', component: Account },
			{ path: 'notifications', component: NotificationSettings },
			{ path: 'admin', component: Admin }
		]
	},
	{ path: '/notifications', component: Notifications },
	{
		path: '/club-admin/:club_id',
		component: ClubAdmin,
		props: true,
		children: [
			{ path: '', redirect: 'information' },
			{ path: 'information', component: Information, props: true },
			{ path: 'members', component: Members, props: true },
			{ path: 'events', component: ClubEvents, props: true },
			{ path: 'posts', component: Posts, props: true }
		]
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

export default router;
