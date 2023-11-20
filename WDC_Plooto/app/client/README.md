# Instructions

## Development
To run this application, you will first need to run `npm install`. This will download all the dependencies locally. The run & view the webpage locally, run `npm run dev` and open the webpage in browser using the link provided in the console.

## Production
For an optimized build ensure dependencies are installed, and then run `npm run build`. This will create a distributable `index.html` in `dist/` that can also be previewed with `http-server`, or using `npm run preview`.


## Notes
As auth is not yet implemented, the `/login` pages and `/signup` pages do not do anything, however the `/login` page is accessible via the Logout button, and the `/signup` page is accessible via the the `/login` page.