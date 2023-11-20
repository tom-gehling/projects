# Pages Plan
<p>

Any initial request will make a call to `api/user/data`. This will include any session data, if the user is not logged in this request will redirect them to `/login`. If the request is successful, then it will return all data about the user and all clubs in the system. Hopefully, there aren't too many clubs so these can be loaded into memory on the initial request.

Any event page will need to make a request to `/api/events` and this will load in all event data required into the events store in the client. The homepage `/` will load `/api/user/timeline`, which will contain events and posts relating to the user based on their profile.

The fetches to the `/update` api paths will come from their respective Editor components from the client. All requests will need to path an authentication check, so a middleware on server will be suitable, and this should include the user_id in the body, after verifying authentication. If they're not authentication, they should be redirected to `/login`, and ideally have a message saying "Invalid Session" or something of that sort.

# API Plan
<p>

## Contents
1. [Notes](#notes)
2. [User](#user)
3. [Club](#club)
4. [Events](#events)
5. [Posts](#posts)
----
## Notes 
All requests will be `POST` as every request will have a body or return a different response based on the user's session ID (which will be included in the session as is not a part of the request body).

The output is often described like this:
```TypeScript
output {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```
As one object this would be 
```TypeScript
output {
	success: boolean,
	error: string | null,
}
```
----
## User

<details>
<summary><code>POST</code> <code>`/api/user/create`</code></summary>
Attempts to create a user with the given input body

Sources:
- `/views/Signup.vue`

```TypeScript
body {
	email: string,
	first_name: string,
	last_name: string,
	display_picture: string
}
```
`display_picture` will be a URL of where the image is hosted.
Will perform an `INSERT` query and return the ID, success will be false if the DB is down or some other IO operation cancels it.
```TypeScript
response {
	success: true,
	ID: string
} | {
	success: false,
	error: string
}
```
</details>
<details>
<summary><code>POST</code> <code>`/api/user/update`</code></summary>
Attempts to update a user update query given the user ID, and updates with the other data specified. This will also handle user deletions, in which case the `status` will be set to 0.

Sources:
- `/views/settings/Account.vue`

```TypeScript
body {
	id: string,
	email: string,
	first_name: string,
	last_name: string,
	display_picture: string,
	notification_settings: any,
	status: 0 | 1
}
```
`display_picture` will be a URL of where the image is hosted.
```TypeScript
response {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```
</details>

<details>
<summary><code>POST</code> <code>`/api/user/timeline`</code></summary>
Loads relevant posts and events for a given user.

Sources:
- `/views/Home.vue`

```TypeScript
body {
	user_id: string // this may also be gotten from session
}
```

```TypeScript
response {
	events: Event[],
	posts: Post[],
} | {
	success: false,
	error: string
}
```
</details>

<details>
<summary><code>POST</code> <code>`/api/user/data`</code></summary>
Loads relevant user information for a given user and all clubs for storage within local memory.

Sources:
- `/views/Home.vue`

```TypeScript
body {
	user_id: string // this may also be gotten from session
}
```
UserInformation is the data form the `Users` table.
```TypeScript
response {
	clubs: Club[],
	user: UserInformation
} | {
	success: false,
	error: string
}
```
</details>

<details>
<summary><code>POST</code> <code>`/api/user/login`</code></summary>
Attempts to login with login data

Sources:
- `/views/Login.vue`

```TypeScript
body {
	email: string,
	password: string
}
```
Will return success if the login was successful
```TypeScript
response {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```
</details>


## Club

<details>
<summary><code>POST</code> <code>`/api/club/create`</code></summary>

Sources:
- club creation component

```TypeScript
input {
	name: string,
	description: string,
	private: boolean,
}
```
Will perform an INSERT query and return the ID, success will be false if the DB is down or some other IO operation cancels it.
```TypeScript
output {
	success: true,
	ID: string
} | {
	success: false,
	error: string
}
```

</details>

<details>
<summary><code>POST</code> <code>`/api/club/update`</code></summary>

Sources:
- `/views/club-admin/Information.vue`

```TypeScript
input {
	id: string,
	name: string,
	description: string,
	private: boolean,
	status: 0 | 1
}
```

```TypeScript
output {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```
</details>

<details>
<summary><code>POST</code> <code>`/api/club/join`</code></summary>

Sources:
- Join club component

```TypeScript
input {
	club_id: string,
	user_id: string,
}
```
As this doesn't require a primary key, we can make use of an UPSERT query or MySQL's equivalent. This also means that the UI doesn't need to wait for a response to continue.
```TypeScript
output {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```

</details>

<details>
<summary><code>POST</code> <code>`/api/club/leave`</code></summary>

Sources:
- Leave club button

```TypeScript
input {
	club_id: string,
	user_id: string,
}
```
Will return success even if the user is not a part of the club
```TypeScript
output {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```

</details>

## Events

<details>
<summary><code>POST</code> <code>`/api/events`</code></summary>

Sources:
- event creation component

```TypeScript
input {
	user_id: string
}
```

```TypeScript
output {
	success: true,
	events: Event[]
} | {
	success: false,
	error: string
}
```

</details>

<details>
<summary><code>POST</code> <code>`/api/event/create`</code></summary>

Sources:
- event creation component

```TypeScript
input {
	title: string,
	description: string,
	location: {
		lat: number,
		lon: number
	},
	start_time: Date,
	end_time: Date,
	club_id: string,
	privacy: "MEMBER" | "OPEN" | "INVITE ONLY"
}
```
Will perform an INSERT query and return the ID, success will be false if the DB is down or some other IO operation cancels it.
```TypeScript
output {
	success: true,
	ID: string
} | {
	success: false,
	error: string
}
```

</details>

<details>
<summary><code>POST</code> <code>`/api/event/update`</code></summary>

Sources:
- `components/EventEditor.vue`

```TypeScript
input {
	id: string,
	title: string,
	description: string,
	location: {
		lat: number,
		lon: number
	},
	start_time: Date,
	end_time: Date,
	club_id: string,
	privacy: "MEMBER" | "OPEN" | "INVITE ONLY",
	status: 0 | 1
}
```
Will perform an INSERT query and return the ID, success will be false if the DB is down or some other IO operation cancels it.
```TypeScript
output {
	success: true,
	error: null,
} | {
	success: false,
	error: string
}
```

</details>

<details>
<summary><code>POST</code> <code>`/api/attendance/upsert`</code></summary>

Sources:
- In the `EventCard` component, when the user changes their event status

```TypeScript
input {
	event_id: string,
	user_id: string,
	rsvp: string,
}
```
As this doesn't require a primary key, we can just send the variables needed and let the backend decide whether it needs to do an insert or update. There might be a UPSERT type query in MySQL, or something similar that we can make us of.
```TypeScript
output {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```
</details>

## Posts

<details>
<summary><code>POST</code> <code>`/api/post/create`</code></summary>

Sources:
- post creation component

```TypeScript
input {
	title: string,
	content: string,
	images: string[],
	club_id: string,
	event_id: string | null
}
```
Will perform an INSERT query and return the ID, success will be false if the DB is down or some other IO operation cancels it.
```TypeScript
output {
	success: true,
	ID: string
} | {
	success: false,
	error: string
}
```

</details>

<details>
<summary><code>POST</code> <code>`/api/post/update`</code></summary>

Sources:
- post editor component

```TypeScript
input {
	id: string,
	title: string,
	content: string,
	images: string[],
	club_id: string,
	event_id: string | null,
	status: 0 | 1
}
```

```TypeScript
output {
	success: true,
	error: null
} | {
	success: false,
	error: string
}
```

</details>