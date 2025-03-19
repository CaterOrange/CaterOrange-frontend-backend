# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /Frontend

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies with specific flags for better reliability
RUN npm cache clean --force && npm install --legacy-peer-deps


COPY . .

# Set environment variable
ENV REACT_APP_URL=https://app.caterorange.com
ENV GOOGLE_MAPS_API_KEY = AIzaSyDODkMU8eu1fLXLB7RLTLis7YEhL0tI2Cg

ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production


# Build the application (if using Create React App or similar)
RUN npm run build

RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-p", "3000"]
