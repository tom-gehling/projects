import { defineStore } from "pinia";
import { removeClubData } from "../functions";
import { isActive, server } from "../utils";

/**
 * @typedef {Object} Club
 * @property {string} club_id
 * @property {string} name
 * @property {string} description
 * @property {string | null} picture_url
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {boolean} private
 * @property {0 | 1} status - 0: inactive, 1: active
 */

/**
 * @typedef {Object} ClubAssociation
 * @property {string} club_id
 * @property {string} user_id
 * @property {"admin" | "member"} role
 */

/**
 * @typedef {Object} ClubRequest
 * @property {string} request_id
 * @property {string} user_id
 * @property {string} club_id
 * @property {"pending" | "approved" | "denied"} state
 * @property {0 | 1} status
 * @property {Date} created_at
 * @property {Date} updated_at
 */

export const useClubStore = defineStore({
	id: 'clubs',
	state: () => ({
		/** @type {Club[]} */
		clubs: [],
		/** @type {ClubAssociation[]} */
		user_clubs: [],
		/** @type {ClubRequest[]} */
		club_requests: []
	}),
	getters: {
		getClubByID: (state) => (club_id) => state.clubs.find((club) => club.club_id === club_id),
		getClubsByIDs: (state) => (club_ids) => state.clubs.filter((club) => club_ids.includes(club.club_id)).filter(isActive),
		getUsersInClub: (state) => (club_id) => state.user_clubs.filter((user_club) => user_club.club_id === club_id),
		getClubsByUserIDs: (state) => (user_ids) => {
			const user_club_ids = state.user_clubs.filter((user_club) => user_ids.includes(user_club.user_id)).map((assoc) => assoc.club_id);
			return state.getClubsByIDs(user_club_ids);
		},
		getAssociations: (state) => (user_id) => state.user_clubs.filter((user_club) => user_club.user_id === user_id),
		getUserRoleInClub: (state) => (club_id, user_id) => {
			const association = state.user_clubs.find((user_club) => user_club.club_id === club_id && user_club.user_id === user_id);
			return association ? association.role : null;
		},
		getUserRequest: (state) => (club_id, user_id) => state.club_requests.find((request) => request.club_id === club_id && request.user_id === user_id),
		getUserAdminClubs(state) {
			return function (user_id) {
				return state.user_clubs
					.filter((user_club) => user_club.user_id === user_id && user_club.role === "admin")
					.map((assoc) => this.getClubByID(assoc.club_id)).filter(isActive);
			};
		}
	},
	actions: {
		replaceClub(club) {
			this.clubs = this.clubs.map((c) => {
				if (c.club_id === club.club_id) {
					return club;
				}
				return c;
			});
		},
		async updateClub(club) {
			const response = await server.put("/api/club/update", club);
			if (!response.success) return response;

			// update the club in the store
			this.replaceClub(club);
			// mimic the post/event deletion if status is 0 as on server
			if (club.status === 0) {
				removeClubData(club);
			}

			return response;
		},
		async createClub(newClub) {
			// generate a new ID client side
			// server will fail if ID already exists.
			const club_id = crypto.randomUUID();
			const club = {
				...newClub,
				club_id,
				created_at: new Date(),
				status: 1
			};

			const response = await server.post("/api/club/create", club);
			if (!response.success) return response;
			// Add the new club to the list of clubs
			this.clubs.push(club);
			return { ...response, ID: club_id };
		},

		setUserRole(club_id, user_id, role) {
			const association = this.user_clubs.find((user_club) => user_club.club_id === club_id && user_club.user_id === user_id);
			if (association) {
				association.role = role;
			} else {
				this.user_clubs.push({
					club_id,
					user_id,
					role
				});
			}
		},
		async updateRole(club_id, user_id, role) {
			const response = await server.post("/api/club/role", { club_id, user_id, role });
			if (!response.success) return response;

			this.setUserRole(club_id, user_id, role);
			return response;
		},
		addClubs(clubs) {
			// add clubs or update existing ones in the store
			for (const club of clubs) {
				const existing_club = this.getClubByID(club.club_id);
				if (existing_club) {
					this.replaceClub(club);
				} else {
					this.clubs.push(club);
				}
			}
		},
		addAssociations(associations) {
			for (const assoc of associations) {
				const existing_assoc = this.user_clubs.find((user_club) => user_club.club_id === assoc.club_id && user_club.user_id === assoc.user_id);
				if (existing_assoc) {
					existing_assoc.role = assoc.role;
				} else {
					this.user_clubs.push(assoc);
				}
			}
		},
		addClubRequests(clubRequests) {
			for (const request of clubRequests) {
				const existing_request = this.club_requests.find((club_request) => club_request.club_id === request.club_id && club_request.user_id === request.user_id);
				if (!existing_request) {
					this.club_requests.push(request);
				} else {
					// replace existing request
					existing_request.status = request.status;
				}
			}
		},
		async joinClub(club_id, user_id) {
			const response = await server.post("/api/club/join", { club_id, user_id });
			if (!response.success) return response;

			this.setUserRole(club_id, user_id, "member");

			return response;
		},
		async requestJoinClub(club_id) {
			const response = await server.post("/api/club/request/join", { club_id });
			if (!response.success) return response;

			this.addClubRequests([response.data.request]);

			return response;
		},
		async leaveClub(club_id, user_id) {
			const response = await server.post("/api/club/leave", { club_id, user_id });
			if (!response.success) return response;

			this.user_clubs = this.user_clubs.filter((user_club) => user_club.club_id !== club_id || user_club.user_id !== user_id);

			return response;
		},
		async removeUserFromClub(club_id, user_id) {
			const response = await server.post("/api/club/kick", { club_id, user_id });
			if (!response.success) return response;
			this.user_clubs = this.user_clubs.filter((user_club) => user_club.club_id !== club_id || user_club.user_id !== user_id);
			return response;
		},
		async denyRequest(club_id, user_id, request_id) {
			const response = await server.put("/api/club/request/deny", { club_id, user_id, request_id });
			return response;
		},
		async acceptRequest(club_id, user_id, request_id) {
			const response = await server.put("/api/club/request/accept", { club_id, user_id, request_id });
			// add the new club association that is generated on accept
			if (response.success) {
				this.addAssociations([response.data.associations]);
			}
			return response;
		},
		async inviteUser(club_id, user_id) {
			const invite_id = crypto.randomUUID();
			const response = await server.post("/api/club/invite", { club_id, user_id, invite_id });
			return response;
		},
		async deleteInvite(invite_id) {
			const response = await server.delete("/api/club/invite", { invite_id });
			return response;
		}

	}
});
