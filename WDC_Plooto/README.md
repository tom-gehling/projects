# Project Milestone 1
There is a design document located in `/planning/Design Document v3.pdf`. This contains most things regarding the deliverables for the first milestone. The design pages are also located in `/planning/pages/`, and these are much easier to view compared to the images in the pdf. There is also `/planning/data_plan.md`, which contains our general plan for our pages and API routes for the backend, this should be viewed using a markdown viewer, like the one inside vscode or on github's website. To run our basic client side implementation follow the instructions below or the instructions ins `/app/client/README.md`

# Development

## Database
To be able to work on the project there are 3 things that need to be running. The first is the SQL server. First, launch the devcontainer and run `service mysql start`, then cd into `/app/server/schema` and run the file `./setup.sh`. If the setup script has not been modified to be an executable, run `chmod +x setup.sh`. This should initialise the database and include test data. There are more instructions in the README in the folder.

## Server
To run the server, cd into `/app/server`, run `npm i` to install dependencies (only need to be done once), and then run `npm run dev` to run the server.

## Client
Then, open a new terminal and cd into `/app/client` and run `npm i` to install dependencies again. Then you can run `npm run dev` and this will start the website on
localhost.

# Other Stuff
- Link for finding icons: [`lucide.dev`](https://lucide.dev/)
- Docs for moment: [`momentjs.com`](https://momentjs.com/docs/)
- Vue-Router: [`router.vuejs.org`](https://router.vuejs.org/)

http://127.0.0.1:5173/