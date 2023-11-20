<template>
	<div class="information-container" v-if="club">
		<form @submit.prevent="updateClub">
			<div class="shadow-xs">
				<label for="description">Description</label>
				<textarea id="description" v-model="club.description"></textarea>
			</div>
			<div class="shadow-xs">
				<label for="picture_url">Picture URL</label>
				<input type="text" id="picture_url" v-model="club.picture_url" />
			</div>
			<div>
				<label for="private" class="checkbox-container">
					Private
					<input type="checkbox" id="private" v-model="private" />
					<span class="checkmark"></span>
				</label>
			</div>
			<div class="button-container shadow-sm">
				<button type="submit" class="generic-button">Update Club</button>
				<button type="button" class="delete-club generic-button" @click="deleteClub">Delete Club</button>
			</div>
		</form>
	</div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import { useClubStore } from "../../stores/clubs";

export default {
	name: "Information",
	props: {
		club_id: {
			type: String,
			required: false,
		},
	},
	computed: {
		private: {
			get() {
				return this.club?.private == 1;
			},
			set(value) {
				this.club.private = value ? 1 : 0;
			},
		},
	},
	setup(props) {
		const club = ref(null);
		const clubStore = useClubStore();

		onMounted(() => {
			const clubFromStore = clubStore.getClubByID(props.club_id);
			if (clubFromStore) {
				club.value = JSON.parse(JSON.stringify(clubFromStore));
			}
		});


		watch(() => props.club_id, () => {
			const clubFromStore = clubStore.getClubByID(props.club_id);
			if (clubFromStore) {
				club.value = JSON.parse(JSON.stringify(clubFromStore));
			}
		});

		return {
			club
		};
	},
	methods: {
		async updateClub() {
			const clubStore = useClubStore();
			const result = await clubStore.updateClub(this.club);
			if (!result.success) {
				alert(result.error);
			}
		},
		async deleteClub() {
			const clubStore = useClubStore();
			const result = await clubStore.updateClub({ ...this.club, status: 0 });
			if (!result.success) {
				alert(result.error);
				return;
			}

			console.log("Redirect");
			// redirect to home
			this.$router.push("/");
		}
	}
};
</script>

<style scoped>
.information-container {
	color: var(--text-primary);
}

form {
	display: flex;
	flex-direction: column;
	gap: 5px;
	width: 100%;
}

input,
textarea {
	width: 100%;
}

.button-container {
	display: flex;
	flex-direction: row;
	gap: 10px;
	justify-content: center;
	align-items: center;
}

.button-container button {
	height: 100%;
	padding: 10px 20px;
	border-radius: var(--normal-border-radius);
	cursor: pointer;
	border: none;
	appearance: none;
	font-size: unset;
}

.delete-club {
	background-color: #e97777;
	color: white;
}

.checkbox-container input[type="checkbox"] {
	display: none;
}

/* Create a custom checkbox */
.checkbox-container {
	display: inline-block;
	position: relative;
	padding-left: 30px;
	cursor: pointer;
	font-size: 18px;
}

.checkbox-container .checkmark {
	position: absolute;
	top: 0;
	left: 0;
	height: 20px;
	width: 20px;
	background-color: var(--bg-secondary);
	border: 1px solid var(--input-border);
	border-radius: 5px;
}

/* On mouse-over, add a grey background color */
.checkbox-container:hover input~.checkmark {
	background-color: var(--bg-secondary);
	opacity: 0.6;
}

/* When the checkbox is checked, add a colored background */
.checkbox-container input:checked~.checkmark {
	background-color: var(--text-tertiary);
	border-color: var(--text-secondary);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkbox-container .checkmark:after {
	content: "";
	position: absolute;
	display: none;
}

/* Show the checkmark when checked */
.checkbox-container input:checked~.checkmark:after {
	display: block;
}

/* Style the checkmark/indicator */
.checkbox-container .checkmark:after {
	left: 6px;
	top: 2px;
	width: 4px;
	height: 10px;
	border: solid white;
	border-width: 0 2px 2px 0;
	transform: rotate(45deg);
}
</style>
