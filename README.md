# Idea.io
A repo for the Idea.io App and website. 

# General Notes on Development
- Created using npm create-react-app
- Production built using npm run build
- Locally ran using serve -s build

# Setting up Firebase
- Once you are ready to deploy, build your app using npm run build.
- install firebase (ensure you are in the same folder where your build folder exists)
- run firebase login 
- run firebase init, select hosting, and type build for public directory, enter N for all overwrites.
- run firebase deploy.