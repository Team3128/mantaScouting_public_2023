Copyright 2023 Team 3128

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

<-------------------------------------------------------->

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
