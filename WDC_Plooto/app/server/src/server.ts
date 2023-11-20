import { app } from "./app";

// Connection to the database and server start
const server = app.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`);
});

export { server };
