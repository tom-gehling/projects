import { SuperAgentTest } from "supertest";

export const COMP_SCI_CLUB_ID = "fabbe893-9869-4653-8941-584530d9cbc2";

export const PERSISTANT_TEST_USER = {
	email: "persistant@test.com",
	first_name: "Persistant",
	last_name: "User",
	password: "password",
};

// create the user and login
export async function getTestUser(agent: SuperAgentTest) {
	// first create user if not exists
	const res = await agent.post("/api/user/create").send(PERSISTANT_TEST_USER);

	expect(res.statusCode).toEqual(200);

	// login user
	const login = await agent.post("/api/user/login").send({
		username: PERSISTANT_TEST_USER.email,
		password: PERSISTANT_TEST_USER.password,
	});
	expect(login.statusCode).toEqual(200);

	// fetch user data
	const data = await agent.get("/api/user/data").send();

	expect(data.statusCode).toEqual(200);
	expect(data.body.data).toBeTruthy();
	expect(data.body.data.user_id).toBeTruthy();

	// return user id
	return data.body.data.user_id as string;
}
