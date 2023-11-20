USE db_name;
INSERT INTO `User`
VALUES (
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'dev@plooto.dev',
		NULL,
		'dev',
		'account',
		'$2a$10$oQDURHJhsl/zDzZ4F9LlLeh3gi2cb39ReLCACy7xLuZOXcO4rSjjq',
		NULL,
		NULL,
		'{}',
		1,
		1,
		NULL,
		'2023-06-04 06:52:29',
		'2023-06-04 06:52:29'
	),
	(
		'bd7b0c1b-e171-4eaa-b641-d843dbbe2a0c',
		'joe.smith@plooto.dev',
		NULL,
		'Joe',
		'Smith',
		'$2a$10$sTz/J97j733RkJErRxunqOfvRCime1.lP.ma5nG.uwhJNLSiRlEOG',
		NULL,
		NULL,
		'{}',
		1,
		0,
		NULL,
		'2023-06-04 07:09:58',
		'2023-06-04 07:09:58'
	),
	(
		'e2b5fe6b-7ec9-4a4d-bc2b-84ded7d9e132',
		'test@test.com',
		NULL,
		'Test',
		'Account',
		'$2a$10$YCFx5vNqbYX4BhXormDBHu.mlfcI8kwbszRWYH7vi9CKjauMaXcdy',
		NULL,
		NULL,
		'{}',
		1,
		0,
		NULL,
		'2023-06-04 03:32:42',
		'2023-06-04 03:32:42'
	);
INSERT INTO `Club`
VALUES (
		'09384768-22ee-40a1-a261-3cb696956a7a',
		'David\'s Society',
		'For all of David Goggins biggest fans!',
		1,
		1,
		'2023-06-04 06:55:46',
		'2023-06-04 06:55:46'
	),
	(
		'5cf86297-0572-4313-86c3-ab326b96afae',
		'Second Test Club',
		'this is a test club please ignore.',
		0,
		1,
		'2023-06-04 04:10:36',
		'2023-06-04 04:10:36'
	),
	(
		'8acb3421-b8b2-4413-a7d3-a60ba6fa1bdc',
		'Fourth Test Club',
		'this is a test club please ignore.',
		0,
		1,
		'2023-06-04 04:12:54',
		'2023-06-04 04:12:54'
	),
	(
		'9954bf37-bacf-4c57-81ca-ed9bc0dec4b9',
		'Maths Club',
		'Join this club for all things related to the wonderful world of mathematics!',
		0,
		1,
		'2023-06-04 06:55:20',
		'2023-06-04 06:55:20'
	),
	(
		'bbaef307-0d86-44ba-9ea0-722b6734300a',
		'Third Test Club',
		'this is a test club please ignore.',
		0,
		1,
		'2023-06-04 04:12:23',
		'2023-06-04 04:12:23'
	),
	(
		'f4c1fde9-c731-464f-9de9-e2c3c52469dc',
		'First Test Club',
		'this is a test club',
		0,
		1,
		'2023-06-04 04:07:05',
		'2023-06-04 04:07:05'
	),
	(
		'fabbe893-9869-4653-8941-584530d9cbc2',
		'Computer Science Club',
		'Club for students studying COMP SCI at Adelaide University.',
		0,
		1,
		'2023-06-04 06:55:03',
		'2023-06-04 06:55:03'
	);
INSERT INTO `ClubUser`
VALUES (
		'09384768-22ee-40a1-a261-3cb696956a7a',
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'admin',
		'2023-06-04 06:55:46',
		'2023-06-04 06:55:46'
	),
	(
		'5cf86297-0572-4313-86c3-ab326b96afae',
		'e2b5fe6b-7ec9-4a4d-bc2b-84ded7d9e132',
		'admin',
		'2023-06-04 04:10:36',
		'2023-06-04 04:10:36'
	),
	(
		'8acb3421-b8b2-4413-a7d3-a60ba6fa1bdc',
		'e2b5fe6b-7ec9-4a4d-bc2b-84ded7d9e132',
		'admin',
		'2023-06-04 04:12:54',
		'2023-06-04 04:12:54'
	),
	(
		'9954bf37-bacf-4c57-81ca-ed9bc0dec4b9',
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'admin',
		'2023-06-04 06:55:20',
		'2023-06-04 06:55:20'
	),
	(
		'9954bf37-bacf-4c57-81ca-ed9bc0dec4b9',
		'bd7b0c1b-e171-4eaa-b641-d843dbbe2a0c',
		'member',
		'2023-06-04 07:29:27',
		'2023-06-04 07:29:27'
	),
	(
		'bbaef307-0d86-44ba-9ea0-722b6734300a',
		'e2b5fe6b-7ec9-4a4d-bc2b-84ded7d9e132',
		'admin',
		'2023-06-04 04:12:23',
		'2023-06-04 04:12:23'
	),
	(
		'f4c1fde9-c731-464f-9de9-e2c3c52469dc',
		'e2b5fe6b-7ec9-4a4d-bc2b-84ded7d9e132',
		'admin',
		'2023-06-04 04:07:05',
		'2023-06-04 04:07:05'
	),
	(
		'fabbe893-9869-4653-8941-584530d9cbc2',
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'admin',
		'2023-06-04 06:55:03',
		'2023-06-04 06:55:03'
	),
	(
		'fabbe893-9869-4653-8941-584530d9cbc2',
		'bd7b0c1b-e171-4eaa-b641-d843dbbe2a0c',
		'member',
		'2023-06-04 07:29:00',
		'2023-06-04 07:29:00'
	),
	(
		'fabbe893-9869-4653-8941-584530d9cbc2',
		'e2b5fe6b-7ec9-4a4d-bc2b-84ded7d9e132',
		'member',
		'2023-06-04 07:30:39',
		'2023-06-04 07:30:39'
	);
INSERT INTO `Event`
VALUES (
		'1cae4a7f-14db-44bd-a95c-08b3fc7ea06c',
		'Karaoke Session 1',
		'Sing your hearts out',
		'{\"lat\": null, \"lng\": null}',
		'2023-07-01 23:30:00',
		'2023-07-02 03:00:00',
		1,
		'private',
		'09384768-22ee-40a1-a261-3cb696956a7a',
		'2023-06-04 07:09:01',
		'2023-06-04 07:09:01'
	),
	(
		'744ecd40-014b-4dca-b0ef-9c35a5aa6ba5',
		'Hackathon v1',
		'You\'re welcome to come and join us for our first Hackathon of the year!',
		'{\"lat\": null, \"lng\": null}',
		'2023-07-13 17:00:00',
		'2023-07-13 23:00:00',
		1,
		'public',
		'fabbe893-9869-4653-8941-584530d9cbc2',
		'2023-06-04 07:05:32',
		'2023-06-04 07:05:32'
	),
	(
		'ae9a1d04-662a-4814-9b8c-72ef2bd7ad20',
		'testet 121',
		'testet 123',
		'{\"lat\": null, \"lng\": null}',
		'2023-06-04 06:33:27',
		'2023-06-04 07:33:27',
		1,
		'public',
		'8acb3421-b8b2-4413-a7d3-a60ba6fa1bdc',
		'2023-06-04 06:33:30',
		'2023-06-04 06:33:30'
	),
	(
		'e23d58c9-747a-4e1c-a3fb-6fdde8373637',
		'a new event',
		'this is a new event!!',
		'{\"lat\": null, \"lng\": null}',
		'2023-06-04 06:43:20',
		'2023-06-04 07:43:20',
		1,
		'public',
		'8acb3421-b8b2-4413-a7d3-a60ba6fa1bdc',
		'2023-06-04 06:43:27',
		'2023-06-04 06:43:27'
	);
-- add some random data
INSERT INTO Club (club_id, name, description)
VALUES (
		'b98f9640-c04c-4304-bf52-fa567f8df0e2',
		'Soccer Enthusiasts',
		'A club for soccer lovers'
	),
	(
		'dbca8d6c-dece-4eb0-946c-2cef5d8d54e3',
		'Sci-Fi Readers',
		'For fans of science fiction'
	),
	(
		'ca50e064-184e-4424-8427-90165c6dff55',
		'Outdoor Adventures',
		'For those who love the great outdoors'
	),
	(
		'fda68080-d438-4c4a-968a-865ab50de841',
		'Culinary Creations',
		'For those who love to cook and eat'
	),
	(
		'54118558-1aea-4c80-b573-696946bd8657',
		'Dance Troupe',
		'For dance lovers and performers'
	),
	(
		'a76fd751-8c69-4bd6-84e1-31ea8fc10b28',
		'Book Exchange',
		'A club for book swapping and discussions'
	),
	(
		'c98a5d20-83d1-4f27-bbb8-b6bd7ebe7a06',
		'Film Club',
		'For film lovers and critics'
	),
	(
		'ad4c6f0e-97d8-4f9d-b5ec-35d4e9f16959',
		'Photography Phans',
		'For photography enthusiasts'
	),
	(
		'cf4e6d25-0227-4b0e-9c20-469aacf5b3a4',
		'Chess Club',
		'Magnus Carlsen went here!'
	);
INSERT INTO User (user_id, email, first_name, last_name, password)
VALUES (
		UUID(),
		'james.smith@test.com',
		'James',
		'Smith',
		'password21'
	),
	(
		UUID(),
		'emily.johnson@test.com',
		'Emily',
		'Johnson',
		'password22'
	),
	(
		UUID(),
		'john.williams@test.com',
		'John',
		'Williams',
		'password23'
	),
	(
		UUID(),
		'linda.brown@test.com',
		'Linda',
		'Brown',
		'password24'
	),
	(
		UUID(),
		'michael.jones@test.com',
		'Michael',
		'Jones',
		'password25'
	),
	(
		UUID(),
		'patricia.miller@test.com',
		'Patricia',
		'Miller',
		'password26'
	),
	(
		UUID(),
		'robert.davis@test.com',
		'Robert',
		'Davis',
		'password27'
	),
	(
		UUID(),
		'jennifer.wilson@test.com',
		'Jennifer',
		'Wilson',
		'password28'
	),
	(
		UUID(),
		'william.moore@test.com',
		'William',
		'Moore',
		'password29'
	),
	(
		UUID(),
		'elizabeth.taylor@test.com',
		'Elizabeth',
		'Taylor',
		'password30'
	),
	(
		UUID(),
		'david.anderson@test.com',
		'David',
		'Anderson',
		'password31'
	),
	(
		UUID(),
		'maria.thomas@test.com',
		'Maria',
		'Thomas',
		'password32'
	),
	(
		UUID(),
		'joseph.jackson@test.com',
		'Joseph',
		'Jackson',
		'password33'
	),
	(
		UUID(),
		'margaret.white@test.com',
		'Margaret',
		'White',
		'password34'
	),
	(
		UUID(),
		'charles.harris@test.com',
		'Charles',
		'Harris',
		'password35'
	),
	(
		UUID(),
		'susan.martin@test.com',
		'Susan',
		'Martin',
		'password36'
	),
	(
		UUID(),
		'thomas.thompson@test.com',
		'Thomas',
		'Thompson',
		'password37'
	),
	(
		UUID(),
		'jessica.garcia@test.com',
		'Jessica',
		'Garcia',
		'password38'
	),
	(
		UUID(),
		'richard.martinez@test.com',
		'Richard',
		'Martinez',
		'password39'
	),
	(
		UUID(),
		'sarah.robinson@test.com',
		'Sarah',
		'Robinson',
		'password40'
	);
INSERT INTO Event (
		event_id,
		title,
		description,
		start_time,
		end_time,
		club_id,
		created_at,
		updated_at
	)
VALUES (
		UUID(),
		'Soccer Match',
		'Join us for a friendly match',
		NOW() + INTERVAL 1 DAY,
		NOW() + INTERVAL 2 DAY,
		'b98f9640-c04c-4304-bf52-fa567f8df0e2',
		TIMESTAMP '2023-05-27 10:00:00',
		TIMESTAMP '2023-05-27 10:00:00'
	),
	(
		UUID(),
		'Book Discussion: Dune',
		'Discussing the classic Sci-Fi novel',
		NOW() + INTERVAL 2 DAY,
		NOW() + INTERVAL 3 DAY,
		'dbca8d6c-dece-4eb0-946c-2cef5d8d54e3',
		TIMESTAMP '2023-05-29 10:10:00',
		TIMESTAMP '2023-05-29 10:10:00'
	),
	(
		UUID(),
		'Hiking Trip',
		'A day out in nature',
		NOW() + INTERVAL 3 DAY,
		NOW() + INTERVAL 4 DAY,
		'ca50e064-184e-4424-8427-90165c6dff55',
		TIMESTAMP '2023-05-31 10:20:00',
		TIMESTAMP '2023-05-31 10:20:00'
	),
	(
		UUID(),
		'Baking Workshop',
		'Learn new baking techniques',
		NOW() + INTERVAL 4 DAY,
		NOW() + INTERVAL 5 DAY,
		'fda68080-d438-4c4a-968a-865ab50de841',
		TIMESTAMP '2023-06-02 10:30:00',
		TIMESTAMP '2023-06-02 10:30:00'
	),
	(
		UUID(),
		'Dance Practice',
		'Regular practice session',
		NOW() + INTERVAL 5 DAY,
		NOW() + INTERVAL 6 DAY,
		'54118558-1aea-4c80-b573-696946bd8657',
		TIMESTAMP '2023-06-04 10:40:00',
		TIMESTAMP '2023-06-04 10:40:00'
	),
	(
		UUID(),
		'Book Swap Meetup',
		'Exchange your old books',
		NOW() + INTERVAL 6 DAY,
		NOW() + INTERVAL 7 DAY,
		'a76fd751-8c69-4bd6-84e1-31ea8fc10b28',
		TIMESTAMP '2023-06-05 10:50:00',
		TIMESTAMP '2023-06-05 10:50:00'
	),
	(
		UUID(),
		'Sci-Fi Movie Night',
		'Watch and discuss a Sci-Fi movie',
		NOW() + INTERVAL 7 DAY,
		NOW() + INTERVAL 8 DAY,
		'dbca8d6c-dece-4eb0-946c-2cef5d8d54e3',
		TIMESTAMP '2023-06-04 11:00:00',
		TIMESTAMP '2023-06-04 11:00:00'
	),
	(
		UUID(),
		'Weekend Camping Trip',
		'Adventure in the wild',
		NOW() + INTERVAL 8 DAY,
		NOW() + INTERVAL 9 DAY,
		'ca50e064-184e-4424-8427-90165c6dff55',
		TIMESTAMP '2023-06-03 11:10:00',
		TIMESTAMP '2023-06-03 11:10:00'
	),
	(
		UUID(),
		'Gourmet Cooking Class',
		'Master the culinary arts',
		NOW() + INTERVAL 9 DAY,
		NOW() + INTERVAL 10 DAY,
		'fda68080-d438-4c4a-968a-865ab50de841',
		TIMESTAMP '2023-06-02 11:20:00',
		TIMESTAMP '2023-06-02 11:20:00'
	),
	(
		UUID(),
		'Choreography Workshop',
		'Learn new dance routines',
		NOW() + INTERVAL 10 DAY,
		NOW() + INTERVAL 11 DAY,
		'54118558-1aea-4c80-b573-696946bd8657',
		TIMESTAMP '2023-06-01 11:30:00',
		TIMESTAMP '2023-06-01 11:30:00'
	),
	(
		UUID(),
		'Gaming Marathon',
		'Join us for a day of competitive and cooperative gaming!',
		'2023-07-18 15:00:00',
		'2023-07-18 18:00:00',
		'fabbe893-9869-4653-8941-584530d9cbc2',
		TIMESTAMP '2023-06-04 08:00:00',
		TIMESTAMP '2023-06-04 08:00:00'
	),
	(
		UUID(),
		'Sci-Fi Book Club Meeting',
		'Discussion on the latest book in our reading list.',
		'2023-07-20 17:00:00',
		'2023-07-20 20:00:00',
		'dbca8d6c-dece-4eb0-946c-2cef5d8d54e3',
		TIMESTAMP '2023-06-04 08:10:00',
		TIMESTAMP '2023-06-04 08:10:00'
	),
	(
		UUID(),
		'Math Tutoring Session',
		'Free tutoring for calculus and algebra.',
		'2023-07-23 14:00:00',
		'2023-07-23 17:00:00',
		'9954bf37-bacf-4c57-81ca-ed9bc0dec4b9',
		TIMESTAMP '2023-06-04 08:15:00',
		TIMESTAMP '2023-06-04 08:15:00'
	),
	(
		UUID(),
		'Art Showcase',
		'Presenting the latest works from our club members.',
		'2023-07-25 18:00:00',
		'2023-07-25 21:00:00',
		'bbaef307-0d86-44ba-9ea0-722b6734300a',
		TIMESTAMP '2023-06-04 08:20:00',
		TIMESTAMP '2023-06-04 08:20:00'
	),
	(
		UUID(),
		'Programming Workshop',
		'Learn the basics of Python programming.',
		'2023-07-27 16:00:00',
		'2023-07-27 19:00:00',
		'fabbe893-9869-4653-8941-584530d9cbc2',
		TIMESTAMP '2023-06-04 08:25:00',
		TIMESTAMP '2023-06-04 08:25:00'
	),
	(
		UUID(),
		'Film Screening',
		'Enjoy a showing of a classic film with discussion afterward.',
		'2023-07-29 19:00:00',
		'2023-07-29 22:00:00',
		'c98a5d20-83d1-4f27-bbb8-b6bd7ebe7a06',
		TIMESTAMP '2023-06-04 08:30:00',
		TIMESTAMP '2023-06-04 08:30:00'
	),
	(
		UUID(),
		'Photography Field Trip',
		'A day trip to capture nature with our cameras.',
		'2023-07-31 08:00:00',
		'2023-07-31 18:00:00',
		'ad4c6f0e-97d8-4f9d-b5ec-35d4e9f16959',
		TIMESTAMP '2023-06-04 08:35:00',
		TIMESTAMP '2023-06-04 08:35:00'
	),
	(
		UUID(),
		'Chess Tournament',
		'Test your skills in our monthly chess tournament.',
		'2023-08-02 13:00:00',
		'2023-08-02 16:00:00',
		'cf4e6d25-0227-4b0e-9c20-469aacf5b3a4',
		TIMESTAMP '2023-06-04 08:40:00',
		TIMESTAMP '2023-06-04 08:40:00'
	),
	(
		UUID(),
		'Vegan Cooking Class',
		'Learn how to make delicious vegan meals.',
		'2023-08-04 18:00:00',
		'2023-08-04 21:00:00',
		'fda68080-d438-4c4a-968a-865ab50de841',
		TIMESTAMP '2023-06-04 08:45:00',
		TIMESTAMP '2023-06-04 08:45:00'
	),
	(
		UUID(),
		'Gardening Workshop',
		'Introduction to home gardening and plant care.',
		'2023-08-06 10:00:00',
		'2023-08-06 13:00:00',
		'ca50e064-184e-4424-8427-90165c6dff55',
		TIMESTAMP '2023-06-04 08:50:00',
		TIMESTAMP '2023-06-04 08:50:00'
	);
-- posts
INSERT INTO Post (
		post_id,
		author_id,
		title,
		content,
		club_id,
		created_at,
		updated_at
	)
VALUES (
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Exploring The Cosmos',
		'Join us for a deep dive into the mysteries of the universe. Each week, we will explore different astronomical phenomena and their scientific explanations. Whether you are an astronomy enthusiast or a professional, this will be an exciting journey through the cosmos.',
		'dbca8d6c-dece-4eb0-946c-2cef5d8d54e3',
		'2023-05-27 09:15:27',
		'2023-05-27 09:15:27'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Annual Chess Tournament',
		'The annual chess tournament is back! This exciting event is open to everyone, regardless of skill level. Whether you are a beginner or an experienced player, there is a place for you. It is not only a chance to compete but also a great opportunity to learn from fellow chess enthusiasts.',
		'cf4e6d25-0227-4b0e-9c20-469aacf5b3a4',
		'2023-05-28 14:22:15',
		'2023-05-28 14:22:15'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Science Fair 2023',
		'We invite all budding scientists to present their projects at our annual Science Fair. This is a great opportunity to showcase your innovative ideas and hard work. The fair will also feature keynote speeches from renowned scientists and researchers in various fields.',
		'dbca8d6c-dece-4eb0-946c-2cef5d8d54e3',
		'2023-05-30 11:30:45',
		'2023-05-30 11:30:45'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Book Club Meeting',
		'This week, we are discussing "The Great Gatsby". This classic novel by F. Scott Fitzgerald explores themes of wealth, love, and the American Dream. Join us for a lively discussion and share your interpretations of this timeless story.',
		'a76fd751-8c69-4bd6-84e1-31ea8fc10b28',
		'2023-05-31 16:00:00',
		'2023-05-31 16:00:00'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Coding Bootcamp',
		'We are organizing a 1-month coding bootcamp for beginners. This bootcamp will cover the basics of programming languages like Python and JavaScript. By the end of this bootcamp, you will have developed a basic web application. Come join us and kickstart your coding journey!',
		'fabbe893-9869-4653-8941-584530d9cbc2',
		'2023-06-01 18:30:00',
		'2023-06-01 18:30:00'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Photography Exhibition',
		'We invite everyone to our annual photography exhibition. The exhibition will showcase the works of our club members as well as other talented photographers in the community. This is a great opportunity to appreciate the art of photography and perhaps get inspired to take your own shots.',
		'ad4c6f0e-97d8-4f9d-b5ec-35d4e9f16959',
		'2023-06-02 10:00:00',
		'2023-06-02 10:00:00'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Football Trials',
		'The football trials for the next semester are here. If you have a passion for football and want to represent our school/college/university in upcoming tournaments, make sure to come for the trials. Remember to bring your kit and be ready to show your skills!',
		'b98f9640-c04c-4304-bf52-fa567f8df0e2',
		'2023-06-03 15:00:00',
		'2023-06-03 15:00:00'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Yoga Classes',
		'Join our weekly yoga classes for a healthier lifestyle. Our experienced instructors will guide you through various yoga poses and breathing techniques that will help improve flexibility, strength, and mental clarity. These classes are open to all, regardless of experience level.',
		'54118558-1aea-4c80-b573-696946bd8657',
		'2023-06-04 08:00:00',
		'2023-06-04 08:00:00'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Art Workshop',
		'We are conducting a hands-on art workshop this weekend. This is a wonderful opportunity for those who want to learn different painting techniques. All materials will be provided, and you will be able to take home your masterpiece!',
		'c98a5d20-83d1-4f27-bbb8-b6bd7ebe7a06',
		'2023-06-05 10:00:00',
		'2023-06-05 10:00:00'
	),
	(
		UUID(),
		'9bc3dae6-7a21-433d-9419-dca750f5301b',
		'Music Festival',
		'Come and enjoy the music festival organized by our club. The festival will feature performances by our talented members as well as guest artists. From classical to pop, there\'s music for every taste. Don\'t forget to bring your friends and family!',
		'54118558-1aea-4c80-b573-696946bd8657',
		'2023-06-05 12:00:00',
		'2023-06-05 12:00:00'
	);