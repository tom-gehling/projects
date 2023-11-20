// passport config
import bcrypt from "bcryptjs";
import passport, { Profile } from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LocalStrategy } from "passport-local";
import { DbRequest } from "../types/types";
import { getUserByGithubIdFromDatabase, getUserFromDatabase, getUserFromDatabaseById, linkUserToGithub } from "./user";

passport.use(
	new LocalStrategy(async (username, password, done) => {
		// TODO: replace with your own database query
		const user = await getUserFromDatabase(username);

		if (!user) {
			return done(null, false, { message: "Incorrect email." });
		}

		// compare entered password with stored hashed password
		if (!bcrypt.compareSync(password, user.password)) {
			return done(null, false, { message: "Incorrect password." });
		}
		const session_user: Express.User = {
			user_id: user.user_id,
			email: user.email,
			password: user.password,
		};

		return done(null, session_user);
	})
);

passport.use(new GitHubStrategy({
	clientID: "c496a93aa05b5df4e30e",
	clientSecret: "eec636271f67c0164ac2216b9612b1aee9502664",
	callbackURL: "http://127.0.0.1:8080/auth/github/callback", // replace with your callback URL
	passReqToCallback: true,
},
	async function (req: DbRequest, accessToken: string, refreshToken: string, profile: Profile, done: any) {
		// Use the profile.id to check if this GitHub account has been linked to a user account in your application
		let user = await getUserByGithubIdFromDatabase(profile.id); // Replace with your database query function
		if (user) {
			// This GitHub account has been linked to a user account in your application, so log in as that user
			done(null, user);
		} else if (req.user?.user_id) {
			// This GitHub account has not been linked to a user account in your application, so link it to the currently authenticated user
			user = await linkUserToGithub(req.user?.user_id, profile.id); // Replace with your function to link a user account to a GitHub account
			done(null, user);
		} else {
		}
	}
));

// serialize and deserialize user instance to and from the session
passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser(async (user: Express.User, done) => {
	// TODO: replace with your own database query
	const db_user = await getUserFromDatabaseById(user.user_id);
	done(null, db_user);
});

export default passport;
