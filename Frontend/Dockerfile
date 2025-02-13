# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /Frontend

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

ENV REACT_APP_URL=https://dev.caterorange.com

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
