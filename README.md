Install node: https://nodejs.org/en/download/

First install, please run `npm install` to install the initial packages

To run local dev server (terminal command):
npm run nep2n; 
npm run mercy;
npm run osprey;

Scripts are in package.json, those commands run `npx snowpack dev --config config/Mercy.config.js`
Those config files are in the config folder, which change the openUrl property to their respective subfolders. 

For example, running `npm run nep2n` runs the respective script in `package.json`. 
Which is `npx snowpack dev --config config/Nep2n.config.js`, and that changes the openURl property to `Nep2n/index.html`, so when you run a live server, the Url opens `localhost:8080/Nep2n/index.html`, which is the project that you want to edit. 

If you're looking to use this system for yourself, 
1. Change `this.firebasePath` in dataStructure.js, as well as `this.firebaseConfig` to your firebase config
2. Change `availPaths` variable in `Mercy/script.js` to the event keys that you are planning to use the database for (e.g 2023casd)
3. Change TBA key in `api_url` variable in `Mercy/script.js` to your TBA key
