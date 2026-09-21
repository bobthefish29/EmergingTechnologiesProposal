
#Telling the docker container what node image i want to use. 
FROM node:22

#This is making app the main working directory for my project
WORKDIR /app

#Copies all the content from package.joson and package-lock.json into the project
COPY package*.json ./

#Installing the dependicies
RUN npm ci

#Coppies the rest of the project into 
COPY . .

#Setting the port to be 3000
EXPOSE 3000

#This is what truly starts the app 
CMD ["node", "app.js"]

