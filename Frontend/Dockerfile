# Use the official Node.js image as the base image
FROM node:20-alpine3.18

# Set the working directory inside the container
WORKDIR /Frontend

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies with specific flags for better reliability
RUN npm install --legacy-peer-deps --no-audit

# Copy the rest of the application code
COPY . .

# Set environment variable
ENV REACT_APP_URL=https://dev.caterorange.com

# Build the application (if using Create React App or similar)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
