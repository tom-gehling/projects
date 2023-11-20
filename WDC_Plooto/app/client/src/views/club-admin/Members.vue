<template>
	<div class="members-container">
		<div class="search-bar">
			<input type="text" v-model="searchName" @input="searchMembers" placeholder="Search Members..." />
			<div>
				<span style="color: var(--text-tertiary); font-size: small; margin: 0px 10px">Sort By </span>
				<select v-model="sortBy">
					<option value="role">Role</option>
					<option value="join_date">Join Date</option>
					<option value="first_name">First Name</option>
					<option value="last_name">Last Name</option>
				</select>
			</div>
			<div
				style="display: flex; flex-direction: row; gap: 5px; margin-left: 5px; padding-left: 15px; border-left: 1px solid var(--bg-tertiary)">
				<button class="generic-button shadow-sm" type="button" @click="openDialog('invitesDialog')">Invites
					<span class="badge" v-if="inviteCount > 0">{{ inviteCount }}</span></button>
				<dialog id="invitesDialog" class="dialog">
					<div class="dialog-content invite-box">
						<div class="search-bar">
							<input type="text" v-model="searchTerm" @input="searchUsers" placeholder="Search Users..." />
						</div>
						<div class="invite-container scrollbar-hide">
							<div v-for="user in filteredInvites" :key="user.user_id" class="shadow-sm">
								<div class="invite">
									<div class="invite-info">
										<div style="display: flex; gap: 5px; min-width: 20vw;">
											<span>{{ user.first_name }}</span>
											<span>{{ user.last_name }}</span>
										</div>
										<div v-if="user.invite_id" class="invite-state">{{ user.state }}</div>
									</div>
									<button v-if="user.invite_id" class="generic-button shadow-sm"
										@click.stop="deleteInvite(user.invite_id)">Cancel</button>
									<button v-else class="generic-button shadow-sm"
										@click.stop="inviteUser(user.user_id)">Invite</button>
								</div>
							</div>
						</div>
						<button @click="closeDialog('invitesDialog')" class="generic-button shadow-sm">Close</button>
					</div>
				</dialog>

				<button class="generic-button shadow-sm" type="button" @click="openDialog('requestsDialog')">Requests
					<span class="badge" v-if="requestCount > 0">{{ requestCount }}</span></button>
				<dialog id="requestsDialog" class="dialog">
					<div class="dialog-content request-box">
						<div class="request-container scrollbar-hide">
							<div v-for="request in filteredRequests" :key="request.user_id" class="shadow-sm">
								<div class="request">
									<div class="request-info">
										<div style="display: flex; gap: 5px; min-width: 20vw;">
											<span>{{ request.first_name }}</span>
											<span>{{ request.last_name }}</span>
										</div>
										<div class="request-state">{{ request.state }}</div>
									</div>
									<div style="display: flex; flex-direction: row; gap: 5px">
										<button class="generic-button shadow-sm"
											@click.stop="acceptRequest(request.user_id, request.request_id)">Accept</button>
										<button class="generic-button shadow-sm"
											@click.stop="denyRequest(request.user_id, request.request_id)">Deny</button>
									</div>
								</div>
							</div>
						</div>
						<button @click="closeDialog('requestsDialog')" class="generic-button shadow-sm">Close</button>
					</div>
				</dialog>

			</div>
		</div>
		<div style="display: flex; flex-direction: column; gap: 5px;">
			<div v-if="sortedMembers.length" v-for="member in sortedMembers" :key="member.id" class="shadow-sm">
				<div class="member">
					<div class="member-info">
						<div style="display: flex; gap: 5px; min-width: 8vw">
							<span style="text-transform: capitalize;">{{ member.first_name }}</span>
							<span style="text-transform: capitalize;">{{ member.last_name }}</span>
						</div>
						<pre class="member-role" style="min-width: 5vw">{{ member.role }}</pre>
						<pre style="min-width: 10vw">{{ member.email }}</pre>
						<div>Joined on {{ this.formattedJoin(member.joined_at) }}</div>
					</div>
					<div class="admin-buttons">
						<button v-if="member.role != 'admin'" class="generic-button shadow-sm"
							@click.stop="makeAdmin(member.user_id)">Make Admin</button>
						<button v-if="member.role != 'admin'" class=" generic-button shadow-sm"
							@click.stop="kickUser(member.user_id)">Remove</button>

					</div>
				</div>
			</div>
			<div v-else-if="searchName.length">
				<span>No members found</span>
			</div>
			<div v-else>
				<span>Loading...</span>
			</div>
		</div>
	</div>
</template>

<script>
import moment from "moment";
import { useClubStore } from "../../stores/clubs";
import { isActive, server } from "../../utils";

export default {
	name: "Members",
	props: {
		club_id: {
			type: String,
			required: false,
		},
	},
	data() {
		return {
			data: {
				members: [],
				invites: [],
				requests: [],
				users: [],
			},
			searchTerm: '',
			searchName: '',
			sortBy: 'role',
		};
	},
	mounted() {
		const fetchData = async () => {
			const response = await server.post("/api/club/members", { club_id: this.club_id });
			if (response.success) {
				this.data = response.data;
			} else {
				alert(response.error);
			}
		};

		fetchData();
	},
	methods: {
		async makeAdmin(user_id) {
			const clubStore = useClubStore();
			const result = await clubStore.updateRole(this.club_id, user_id, "admin");
			if (!result.success) {
				alert(result.error);
				return;
			}

			// update members locally
			const assoc = this.data.members.find((assoc) => assoc.user_id == user_id);
			assoc.role = "admin";
		},
		async kickUser(user_id) {
			const clubStore = useClubStore();
			const result = await clubStore.removeUserFromClub(this.club_id, user_id);
			if (!result.success) {
				alert(result.error);
				return;
			}

			// update members locally
			const assoc = this.data.members.find((assoc) => assoc.user_id == user_id);
			this.data.members.splice(this.data.members.indexOf(assoc), 1);
		},
		openDialog(id) {
			const dialog = document.getElementById(id);
			dialog.showModal();
		},
		closeDialog(id) {
			const dialog = document.getElementById(id);
			dialog.close();
		},
		async deleteInvite(invite_id) {
			const clubStore = useClubStore();
			const result = await clubStore.deleteInvite(invite_id);
			if (!result.success) {
				alert(result.error);
				return;
			}

			// set invite's status to 0 using a map function
			this.data.invites = this.data.invites.map((invite) => {
				if (invite.invite_id == invite_id) {
					invite.status = 0;
				}
				return invite;
			});

		},
		async inviteUser(user_id) {
			const clubStore = useClubStore();
			const result = await clubStore.inviteUser(this.club_id, user_id);
			if (!result.success) {
				alert(result.error);
				return;
			}

			// update invites locally
			this.data.invites.push(result.data.invite);
		},
		async acceptRequest(user_id, request_id) {
			const clubStore = useClubStore();
			const result = await clubStore.acceptRequest(this.club_id, user_id, request_id);
			if (!result.success) {
				alert(result.error);
				return;
			}

			// update requests locally
			const request = this.data.requests.find((request) => request.user_id == user_id);
			this.data.requests.splice(this.data.requests.indexOf(request), 1);

			// add member from result
			this.data.members.push(...result.data.members);
		},
		async denyRequest(user_id, request_id) {
			const clubStore = useClubStore();
			const result = await clubStore.denyRequest(this.club_id, user_id, request_id);
			if (!result.success) {
				alert(result.error);
				return;
			}

			// update requests locally
			const request = this.data.requests.find((request) => request.user_id == user_id);
			this.data.requests.splice(this.data.requests.indexOf(request), 1);
		},
		formattedJoin(join_date) {
			return moment(join_date).format("MMMM Do YYYY");
		},
	},
	computed: {
		sortedMembers() {
			const sortKey = this.sortBy;
			return [...this.filteredMembers].sort((a, b) => {
				if (sortKey === "join_date") {
					return new Date(a.joined_at) - new Date(b.joined_at);
				} else if (sortKey === "first_name") {
					return a.first_name.localeCompare(b.first_name);
				} else if (sortKey === "last_name") {
					return a.last_name.localeCompare(b.last_name);
				} else {
					const a_admin = a['role'] == 'admin';
					const b_admin = b['role'] == 'admin';
					return b_admin - a_admin;
				}
			});
		},
		club() {
			const clubStore = useClubStore();
			return this.club_id ? clubStore.getClubByID(this.club_id) : null;
		},
		members() {
			return this.data.members;
		},
		filteredInvites() {
			// Merge users and invites lists
			const usersWithInvites = this.data.users.map(user => {
				const invite = this.data.invites.filter(isActive).find(invite => invite.user_id === user.user_id);
				if (invite) {
					return { ...user, invite_id: invite.invite_id, state: invite.state };
				} else {
					return user;
				}
			});

			if (!this.searchTerm) {
				return usersWithInvites.filter(user => user.invite_id);
			}

			return usersWithInvites.filter(user =>
			(user.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				user.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()))
			);
		},
		inviteCount() {
			return this.data.invites.filter(isActive).length;
		},
		requestCount() {
			return this.data.requests.filter(isActive).length;
		},
		filteredMembers() {
			if (!this.searchName) {
				return this.data.members;
			}

			const searchNameLower = this.searchName.toLowerCase();

			return this.data.members.filter(user =>
				user.first_name.toLowerCase().includes(searchNameLower) ||
				user.last_name.toLowerCase().includes(searchNameLower)
			);
		},
		filteredRequests() {
			return this.data.requests.filter(isActive).filter((request) => request.state != 'approved');
		}
	}
};
</script>

<style scoped>
.members-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
	color: var(--text-primary);
}

.search-bar {
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
}

select {
	width: min-content;
}

.member {
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
	padding: 5px 20px;
	background-color: var(--bg-secondary);
	border-radius: var(--normal-border-radius);
}

.member-info {
	display: flex;
	flex-direction: row;
	gap: 20px;
	align-items: center;
	width: 100%;
	flex-wrap: wrap;
}

@media (max-width: 1200px) {
	.member {
		flex-direction: column;
		align-items: flex-start;
	}

	.member-info {
		width: 100%;
	}

	.admin-buttons {
		flex-wrap: wrap;
	}
}

.admin-buttons {
	display: flex;
	flex-direction: row;
	gap: 20px;
	white-space: nowrap;
}

.dialog {
	width: min(80%, 1200px);
	height: min(80%, 800px);
}

.invite {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 10px;
	align-items: center;
	padding: 5px 20px;
	background-color: var(--bg-secondary);
	border-radius: var(--normal-border-radius);

	color: var(--text-primary);
}

.invite-info {
	display: flex;
	flex-direction: row;
	gap: 5px;
	align-items: center;
}

.invite-container {
	display: flex;
	flex-direction: column;
	gap: 5px;
	overflow-y: scroll;
	height: 100%;

}

.invite-box {
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	height: 100%;
}

.invite-state {
	font-size: smaller;
	color: var(--text-secondary);
}

.request {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 10px;
	align-items: center;
	padding: 5px 20px;
	background-color: var(--bg-secondary);
	border-radius: var(--normal-border-radius);
	color: var(--text-primary);
}

.request-info {
	display: flex;
	flex-direction: row;
	gap: 5px;
	align-items: center;
}

.request-container {
	display: flex;
	flex-direction: column;
	gap: 5px;
	overflow-y: scroll;
	height: 100%;
}

.request-box {
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	height: 100%;
}

.request-state {
	font-size: smaller;
	color: var(--text-secondary);
}

.badge {
	position: absolute;
	top: -5px;
	right: -5px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	background-color: var(--accent-primary);
	/* Customize the badge background color */
	color: white;
	/* Customize the badge text color */
	font-size: 12px;
	/* Customize the badge font size */
	border-radius: 50%;
}
</style>

