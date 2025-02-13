# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /Frontend

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Clean npm cache and install dependencies with legacy peer deps
RUN npm cache clean --force && npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV REACT_APP_URL=https://dev.caterorange.com

# Expose the port the app runs on
EXPOSE 3000

# Set permissions for the working directory
RUN chown -R node:node /Frontend

# Use a non-root user
USER node

# Start the application
CMD ["npm", "start"]
