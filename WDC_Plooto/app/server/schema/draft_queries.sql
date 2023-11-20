/*Displayed as:
--**** File
    --** Function
        SQL query / comment
            Prepared Statement Parameter
*/




-- ****CLUBS ROUTER
    -- **Create new club
        -- Check club doesn't already exist
        SELECT * FROM Club WHERE (name = ? OR club_id = ?) AND status <> 0;
            -- [input.name, input.club_id]
        --If not, insert club
        INSERT INTO Club (club_id, name, description, private) VALUES (?, ?, ?, ?);
            -- [input.club_id, input.name, input.description, input.private]
        -- user automatically added to the club
        INSERT INTO ClubUser (club_id, user_id, role) VALUES (?, ?, 'admin');
            -- [input.club_id, user_id]


    -- **Updating Club
        SELECT * FROM Club WHERE club_id = ?;
            -- [input.club_id]
        -- check that user is either a system admin, or an admin of the club
        SELECT * FROM User WHERE user_id = ? AND system_admin = 1;
            -- [input.club_id, user_id]);
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [input.club_id, user_id]);
        UPDATE Club SET name = ?, description = ?, private = ?, status = ? WHERE club_id = ?;
            -- [input.name ?? rows[0].name, input.description ?? rows[0].description, input.private ?? rows[0].private, input.status ?? rows[0].status,	input.club_id];
        -- if (input.status === 0) {
        -- also set all club post status to 0 and club events status to 0
        UPDATE Post SET status = 0 WHERE club_id = ?;
            -- [input.club_id]);
        UPDATE Event SET status = 0 WHERE club_id = ?;
            -- [input.club_id]);


    -- **Post Data to Club
        SELECT * FROM Club WHERE club_id = ?;
            -- [input.club_id]
        --get members from club
        SELECT ClubUser.role, ClubUser.created_at AS joined_at, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url, User.user_id FROM ClubUser
        LEFT JOIN User ON ClubUser.user_id = User.user_id
        WHERE club_id = ?;
            -- [input.club_id]);
        -- get all public events & posts include count of who's going & interest to each event
        SELECT Event.*,
            (SELECT COUNT(*) FROM EventUser WHERE Event.event_id = EventUser.event_id AND EventUser.rsvp = 'going') AS going,
            (SELECT COUNT(*) FROM EventUser WHERE Event.event_id = EventUser.event_id AND EventUser.rsvp = 'interested') AS interested
        FROM Event
        WHERE Event.club_id = ? AND Event.privacy = 'public' AND Event.status = 1;
            -- [input.club_id]);
        SELECT Post.* FROM Post
        WHERE Post.club_id = ? AND Post.status = 1;
            -- [input.club_id]);


    -- **Post Members
        -- fetch all members of the club and their user information
        SELECT ClubUser.role, ClubUser.created_at AS joined_at, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url, User.user_id FROM ClubUser
        LEFT JOIN User ON ClubUser.user_id = User.user_id
        WHERE ClubUser.club_id = ?;
            -- [input.club_id]);
        --fetch all invites and requests as well
        SELECT ClubInvite.invite_id, ClubInvite.created_at, ClubInvite.status, ClubInvite.state, ClubInvite.user_id, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url FROM ClubInvite
        LEFT JOIN User ON ClubInvite.user_id = User.user_id
        WHERE ClubInvite.club_id = ? AND ClubInvite.status <> 0;
            --[input.club_id]);
        SELECT ClubRequest.request_id, ClubRequest.created_at, ClubRequest.status, ClubRequest.state, ClubRequest.user_id, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url FROM ClubRequest
        LEFT JOIN User ON ClubRequest.user_id = User.user_id
        WHERE ClubRequest.club_id = ? AND ClubRequest.status <> 0;
            --[input.club_id]);
        -- fetch all users as well this is for searching users to invite
        SELECT User.first_name, User.last_name, User.email, User.picture_url, User.user_id FROM User;


    -- **Club Events
        -- fetch all events of the club
        SELECT * FROM Event
        WHERE club_id = ?;
            -- [input.club_id]);
        -- fetch all attendance records
        SELECT * FROM EventUser
        WHERE event_id IN (?);


    --**Join Club
        -- Check if club exists
        SELECT * FROM Club WHERE club_id = ?;
            -- [input.club_id]);
        -- Check if user is already a member
        SELECT ClubUser.*, User.first_name, User.last_name FROM ClubUser LEFT JOIN User ON ClubUser.user_id = User.user_id WHERE ClubUser.club_id = ? AND ClubUser.user_id = ?;
            -- [input.club_id, user_id]);
        SELECT * FROM User WHERE user_id = ?;
            -- [user_id]);
        --Add user to club
        INSERT INTO ClubUser (club_id, user_id) VALUES (?, ?);
            -- [input.club_id, user_id]);
        --notifty admins that new user has joined club
        SELECT User.user_id  FROM ClubUser LEFT JOIN User ON ClubUser.user_id = User.user_id WHERE ClubUser.club_id = ? AND ClubUser.role = 'admin';
            -- [input.club_id]);


    --**Leave Club
        -- Check if club exists
        SELECT * FROM Club WHERE club_id = ?;
            -- [input.club_id]);
        -- Check if user is a member
        SELECT ClubUser.*, User.first_name, User.last_name FROM ClubUser LEFT JOIN User ON ClubUser.user_id = User.user_id WHERE ClubUser.club_id = ? AND ClubUser.user_id = ?;
            -- [input.club_id, user_id]);
        --Remove user from club
        DELETE FROM ClubUser WHERE club_id = ? AND user_id = ?;
            -- [input.club_id, user_id]);
        -- alert all admins that user has left club
        SELECT User.user_id FROM ClubUser
        LEFT JOIN User ON ClubUser.user_id = User.user_id
        WHERE ClubUser.club_id = ? AND ClubUser.role = 'admin';
            --[input.club_id]);


    --** Modify Role
        -- Check if club exists
        SELECT * FROM Club WHERE club_id = ?;
            -- [input.club_id]);
        -- Check if admin is an admin of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [input.club_id, admin_id]);
        -- Insert user's role
        INSERT INTO ClubUser (club_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?;
            -- [input.club_id, input.user_id, input.role, input.role]);


    --** Kick User
        --Check if club exists
        SELECT * FROM Club WHERE club_id = ?;
            -- [input.club_id]);
        --Check if admin is an admin of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [input.club_id, admin_id]);
        SELECT * FROM User WHERE user_id = ? AND system_admin = 1;
            -- [admin_id]);
        -- Remove user from club
        DELETE FROM ClubUser WHERE club_id = ? AND user_id = ?;
            -- [input.club_id, input.user_id]);




-- ****INVITES ROUTER
    -- **Create Invite
        -- Check if user is an admin of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [input.club_id, admin_id]);
        -- make sure invite doesn't already exist
        SELECT * FROM ClubInvite WHERE invite_id = ?;
            -- [input.invite_id]);
        -- Insert the invitation
        INSERT INTO ClubInvite (invite_id, admin_id, user_id, club_id) VALUES (?, ?, ?, ?);
            -- [input.invite_id, admin_id, input.user_id, input.club_id]);
        -- return invite in same format as get invite in /members
        SELECT ClubInvite.invite_id, ClubInvite.created_at, ClubInvite.status, ClubInvite.state, ClubInvite.user_id, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url FROM ClubInvite
        LEFT JOIN User ON ClubInvite.user_id = User.user_id
        WHERE ClubInvite.invite_id = ?;
            -- [input.invite_id]);
        -- get the club name
        SELECT name FROM Club WHERE club_id = ?;
            -- [input.club_id]);


    --**Delete Invite
        -- Check if invite exists
        SELECT * FROM ClubInvite WHERE invite_id = ?;
            -- [input.invite_id]);
        -- Check if user is an admin of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [invite[0].club_id, admin_id]);
        -- Delete the invitation (set status to 0)
        UPDATE ClubInvite SET status = 0 WHERE invite_id = ?;
            -- [input.invite_id]);


    --**Accept Invite
        UPDATE ClubInvite SET state = 'accepted' WHERE invite_id = ? AND user_id = ?;
            -- [input.invite_id, user_id]);
        -- Insert the user into the club as a member
        INSERT INTO ClubUser (club_id, user_id, role) SELECT club_id, user_id, 'member' FROM ClubInvite WHERE invite_id = ?;
            -- [input.invite_id]);


    --**Reject Invite
        UPDATE ClubInvite SET state = 'rejected' WHERE invite_id = ? AND user_id = ?;
            -- [input.invite_id, user_id]);


    --** Get Invites
        SELECT * FROM ClubInvite WHERE user_id = ?;
            -- [user_id]);




-- ****REQUESTS ROUTER
    --** Accept
        --Check if user is an admin of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [input.club_id, admin_id]);
        -- check if there is a request
        SELECT * FROM ClubRequest WHERE request_id = ? AND status <> 0;
            -- [input.request_id]);
        -- delete the request
        DELETE FROM ClubRequest WHERE request_id = ?;
            -- [input.request_id]);
        INSERT INTO ClubUser (club_id, user_id, role) VALUES (?, ?, 'member');
            -- [input.club_id, input.user_id]);
        -- return the new ClubUser record
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ?;
            -- [input.club_id, input.user_id]);
        -- fetch all members of the club and their user information
        SELECT ClubUser.role, ClubUser.created_at AS joined_at, User.first_name, User.last_name, User.email, User.phone_number, User.birth_date, User.picture_url, User.user_id FROM ClubUser
        LEFT JOIN User ON ClubUser.user_id = User.user_id
        WHERE ClubUser.club_id = ? AND ClubUser.user_id = ?;
            -- [input.club_id, input.user_id]);


    --** Deny
        --Check if user is an admin of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ? AND role = 'admin';
            -- [input.club_id, admin_id]);
        -- check if there is a request
        SELECT * FROM ClubRequest WHERE request_id = ? AND status <> 0;
            -- [input.request_id]);
        -- Update the request
        UPDATE ClubRequest SET state = 'denied' WHERE request_id = ?;
            -- [input.request_id]);


    --** Join
        -- check if the user is already a member of the club
        SELECT * FROM ClubUser WHERE club_id = ? AND user_id = ?;
            -- [input.club_id, user_id]);
        -- check if the user has already requested to join the club
        SELECT * FROM ClubRequest WHERE club_id = ? AND user_id = ? AND status <> 0;
            -- [input.club_id, user_id]);
        -- create the request
        INSERT INTO ClubRequest (club_id, user_id) VALUES (?, ?);
            -- [input.club_id, user_id]);
        -- return the request row
        SELECT * FROM ClubRequest WHERE club_id = ? AND user_id = ?;
            -- [input.club_id, user_id]);




--**** EVENT ROUTER
    --** Get all events and users
        SELECT * FROM Event;
	    SELECT * FROM EventUser;


    --** Post
        -- we want to return an object with { events, members } where members includes User information and rsvp status
        SELECT * FROM Event WHERE event_id IN (?);
            -- [input.event_ids]);
        SELECT EventUser.rsvp, EventUser.updated_at, User.user_id, User.email, User.first_name, User.last_name, User.picture_url FROM EventUser
        LEFT JOIN User ON EventUser.user_id = User.user_id
        WHERE event_id IN (?);
            -- [input.event_ids]);


    --** Create
        -- Check event doesnt exist
        SELECT * FROM Event WHERE title = ? OR event_id = ?;
            -- [input.title, input.event_id]);
        INSERT INTO Event (event_id, title, description, location, start_time, end_time, status, privacy, club_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            -- [input.event_id, input.title, input.description, JSON.stringify(input.location), input.start_time, input.end_time, 1, input.privacy, input.club_id]);


    --** Update
        -- Check event exists
            SELECT * FROM Event WHERE title = ? OR event_id = ?;
                -- [input.title, input.event_id]);
        -- check that the user is an admin of the club that the event is a part of, or that the user is a system_admin
        SELECT * FROM User WHERE user_id = ? AND system_admin = 1;
            -- [user_id]);
        -- if (!admin.length) {
        SELECT * FROM ClubUser WHERE user_id = ? AND club_id = ? AND role = 'admin';
            -- [user_id, rows[0].club_id]);
        UPDATE Event SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?, status = ?, privacy = ? WHERE event_id = ?;
            /*[input.title ?? rows[0].title,
            input.description ?? rows[0].description,
            JSON.stringify(input.location ?? rows[0].location),
            input.start_time ?? rows[0].start_time,
            input.end_time ?? rows[0].end_time,
            input.status ?? rows[0].status,
            input.privacy ?? rows[0].privacy,
            input.event_id]);*/


    --** Get data
        -- Check event exists
        SELECT * FROM Event WHERE event_id = ?;
            -- [input.event_id]);


    --** Attendance upsert
        -- Check event exists
            SELECT * FROM Event WHERE event_id = ?;
                -- [input.event_id]);
        -- upsert user's event attendance
	    INSERT INTO EventUser (event_id, user_id, rsvp) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rsvp = ?;
            -- [input.event_id, user_id, input.rsvp, input.rsvp]);




--**** INDEX ROUTER
    --** Get Admin
        --check if user is a system_admin
		SELECT * FROM User
		WHERE user_id = ? AND system_admin = 1;
	        -- [user_id]);
        -- fetch all the data for everything
        SELECT * FROM Club;
        SELECT * FROM Event;
        SELECT * FROM Post;
        SELECT * FROM User;
        SELECT * FROM ClubUser;


    --** Get all data for a user
        -- Fetch user's clubs
        SELECT Club.* FROM Club
        JOIN ClubUser ON Club.club_id = ClubUser.club_id
        WHERE ClubUser.user_id = ? AND Club.status <> 0;
		    -- [user_id]);
        -- Fetch club's events
		SELECT Event.* FROM Event
		LEFT JOIN EventUser ON Event.event_id = EventUser.event_id
		WHERE (EventUser.user_id = ? OR Event.club_id IN (
        SELECT ClubUser.club_id FROM ClubUser WHERE ClubUser.user_id = ?));
		    -- [user_id, user_id]);
		-- Fetch club's posts
        SELECT Post.* FROM Post
        WHERE Post.club_id IN (
        SELECT ClubUser.club_id FROM ClubUser WHERE ClubUser.user_id = ?);
		    -- [user_id]);
		-- Fetch user's club associations
        SELECT ClubUser.* FROM ClubUser
        WHERE ClubUser.user_id = ? OR ClubUser.club_id IN (
        SELECT ClubUser.club_id FROM ClubUser WHERE ClubUser.user_id = ?);
		    -- [user_id, user_id]);
		-- Fetch user's event attendance
        SELECT EventUser.* FROM EventUser
        WHERE EventUser.user_id = ?
		    -- [user_id]);
		-- fetch all clubs
		SELECT * FROM Club;
		-- fetch notifications for user
        SELECT Notification.* FROM Notification
        WHERE Notification.user_id = ?;
		    -- [user_id]);
		-- fetch all club requests by the user
        SELECT ClubRequest.* FROM ClubRequest
        WHERE ClubRequest.user_id = ?
		    -- [user_id]);


--**** POST ROUTER
    --** Create
        -- check that the post doesn't already exist with the same ID
	    SELECT * FROM Post WHERE post_id = ?;
            -- [input.data.post_id]);
        INSERT INTO Post (post_id, author_id, title, content, club_id, event_id) VALUES (?, ?, ?, ?, ?, ?);
		    -- [input.data.post_id, req.user?.user_id, input.data.title, input.data.content, input.data.club_id, input.data.event_id]

    --** Update
        -- Check post exists
        SELECT * FROM Post WHERE post_id = ?;
            -- [input.data.post_id]);
        UPDATE Post SET title = ?, content = ?, status = ? WHERE post_id = ?;
            /*[
            input.data.title ?? rows[0].title,
            input.data.content ?? rows[0].content,
            input.data.status ?? rows[0].status,
            input.data.post_id,
            ]);*/




--**** USER ROUTER
    --** Create
        -- check user doesn't already exist
        SELECT * FROM User WHERE email = ?;
            -- [input.data.email]);
        INSERT INTO User (user_id, email, first_name, last_name, password, picture_url) VALUES (?, ?, ?, ?, ?, ?);
            /*[
            user_id,
            input.data.email,
            input.data.first_name,
            input.data.last_name,
            hashedPassword,
            input.data.picture_url,
            ]);*/
        -- then return the user row
	    SELECT * FROM User WHERE user_id = ?;
            -- [user_id]);


    --** Get data
        -- check if user exists
        SELECT * FROM User WHERE user_id = ?;
            -- [user_id]


    --** Update
        -- check user exists
        SELECT * FROM User WHERE user_id = ?;
            -- [input.user_id]
        -- if the user is not the same user, or if the user is not an admin, send error
	    SELECT * FROM User WHERE user_id = ? AND system_admin = 1;
            -- [user_id]);

    --** get Timeline
        -- Get clubs the user is part of
		SELECT club_id FROM ClubUser WHERE user_id = ?;
            -- [user_id]);
        -- Get posts and events from the clubs user is part of
		SELECT * FROM Post WHERE club_id IN (?);
            -- [club_ids]);
		SELECT * FROM Event WHERE club_id IN (?);
            -- [club_ids]);

    --** Get top 10 trending events
        SELECT Event.*, COUNT(*) as rsvp_count
        FROM Event JOIN EventUser ON Event.event_id = EventUser.event_id
        WHERE EventUser.rsvp != "none"
        GROUP BY Event.event_id
        ORDER BY rsvp_count DESC
        LIMIT 10;
        -- send using ids
        SELECT * FROM EventUser WHERE event_id IN (?);
            -- [event_ids]

    --** get Notifications
        SELECT * FROM Notification WHERE Notification.user_id = ?;
            -- [user_id]




--**** UTILS/NOTIFICATIONS
    --**Sends a notification to a single user, use {@link createNotifications} to send to multiple users
        --get emails
        SELECT email
        FROM User
        WHERE user_id = ?;
            --[user_id]));
        --add to users notifications
        INSERT INTO Notification (user_id, title, description, type, metadata)
        VALUES (?, ?, ?, ?, ?);
            -- [user_id, title, description, type, JSON.stringify(metadata)]);


    --**Create Notification
        --get user email
        SELECT email
        FROM User
        WHERE user_id IN (?);
            -- [filtered_user_ids]
        INSERT INTO Notification (user_id, title, description, type, metadata)
        VALUES ?;
		    -- [rows]);


    --** New Post / New Event
        -- fetch the post
        SELECT * FROM Post WHERE post_id = ?;
            -- [post_id]);
        -- fetch the club
        SELECT * FROM Club WHERE club_id = ?;
            -- [post[0].club_id]);
        -- fetch the club members
        SELECT * FROM ClubUser WHERE club_id = ?;
            -- [club[0].club_id]);


    --** Check Upcoming Events
        SELECT
        eu.user_id,
        e.event_id,
        e.title AS event_name,
        e.start_time,
        e.end_time
        FROM
        EventUser AS eu
		JOIN
        Event AS e ON eu.event_id = e.event_id
		WHERE
        eu.notified_status = 0
        AND
        e.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR);
        -- update notified status
        UPDATE EventUser
        SET notified_status = 1
        WHERE user_id = ? AND event_id = ?
		    -- [user_id, event_id]);


    --** Has Notification Enabled
        -- fetch users notification settings
        SELECT notification_settings FROM User WHERE user_id = ?;
	        --[user_id]);




--**** UTILS/USERS
    --** get User From Database
        SELECT * FROM User WHERE email = ?;
            -- [email]


    --** get User From Database by ID
        SELECT * FROM User WHERE user_id = ?;
            -- [user_id]


    --** get User From Database by Github ID
        SELECT * FROM User WHERE github_id = ?;
            -- [github_id]


    --** link User To Github
        UPDATE User SET github_id = ? WHERE user_id = ?;
            -- [github_id, user_id]
        -- Fetch the updated user from the database
        SELECT * FROM User WHERE user_id = ?;
            -- [user_id]
