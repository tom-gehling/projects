USE db_name;
-- Randomly adding users to clubs
DELIMITER //

CREATE PROCEDURE addUsersToClubs() BEGIN
DECLARE _user_id CHAR(36);
DECLARE _club_id CHAR(36);
DECLARE _count INT;
DECLARE done INT DEFAULT FALSE;
DECLARE all_clubs_joined INT DEFAULT FALSE;
DECLARE cur CURSOR FOR
SELECT user_id
FROM User;
DECLARE CONTINUE HANDLER FOR NOT FOUND
SET done = TRUE;
OPEN cur;
read_loop: LOOP FETCH cur INTO _user_id;
IF done THEN LEAVE read_loop;
END IF;
SET _count = 0;
SET all_clubs_joined = FALSE;
WHILE _count < 3
AND all_clubs_joined = FALSE DO -- Fetch a club that the user is not currently a member of.
SELECT club_id INTO _club_id
FROM Club
WHERE club_id NOT IN (
		SELECT club_id
		FROM ClubUser
		WHERE user_id = _user_id
	)
ORDER BY RAND()
LIMIT 1;
-- If we found such a club, create the new association.
IF _club_id IS NOT NULL THEN
INSERT INTO ClubUser(user_id, club_id)
VALUES(_user_id, _club_id);
SET _count = _count + 1;
ELSE -- If we didn't find a club (all clubs are already joined), set the flag to true.
SET all_clubs_joined = TRUE;
END IF;
END WHILE;
END LOOP;
CLOSE cur;
END//

DELIMITER ;

CALL addUsersToClubs();

-- add users to events randomly
DELIMITER //

CREATE PROCEDURE addUsersToEvents()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE _user_id CHAR(36);
  DECLARE cur CURSOR FOR SELECT user_id FROM User;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;

  read_loop: LOOP
    FETCH NEXT FROM cur INTO _user_id;

    IF done THEN
      LEAVE read_loop;
    ELSE
      -- Respond 'going' to 3 events.
      INSERT INTO EventUser (event_id, user_id, rsvp)
      SELECT event_id, _user_id, 'going'
      FROM Event
      WHERE event_id NOT IN (SELECT event_id FROM EventUser WHERE user_id = _user_id)
      ORDER BY RAND()
      LIMIT 3;

      -- Respond 'interested' to 5 events.
      INSERT INTO EventUser (event_id, user_id, rsvp)
      SELECT event_id, _user_id, 'interested'
      FROM Event
      WHERE event_id NOT IN (SELECT event_id FROM EventUser WHERE user_id = _user_id)
      ORDER BY RAND()
      LIMIT 5;
    END IF;
  END LOOP;

  CLOSE cur;
END//

DELIMITER ;

CALL addUsersToEvents();

DELIMITER //

CREATE PROCEDURE addRequestsAndInvites()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE _user_id CHAR(36);
  DECLARE _admin_id CHAR(36);
  DECLARE cur CURSOR FOR SELECT user_id FROM User;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;

  read_loop: LOOP
    FETCH NEXT FROM cur INTO _user_id;

    IF done THEN
      LEAVE read_loop;
    ELSE
      -- Send 2 requests from the user to random clubs where they are not already a member.
      INSERT INTO ClubRequest (request_id, user_id, club_id, state)
      SELECT (uuid()), _user_id, club_id, 'pending'
      FROM Club
      WHERE club_id NOT IN (SELECT club_id FROM ClubUser WHERE user_id = _user_id)
      ORDER BY RAND()
      LIMIT 2;

      -- Receive 2 invites for the user from random clubs where they are not already a member.
      SELECT user_id INTO _admin_id FROM User ORDER BY RAND() LIMIT 1;
      INSERT INTO ClubInvite (invite_id, admin_id, user_id, club_id, state)
      SELECT (uuid()), _admin_id, _user_id, club_id, 'pending'
      FROM Club
      WHERE club_id NOT IN (SELECT club_id FROM ClubUser WHERE user_id = _user_id)
      ORDER BY RAND()
      LIMIT 2;
    END IF;
  END LOOP;

  CLOSE cur;
END//

DELIMITER ;

CALL addRequestsAndInvites();

