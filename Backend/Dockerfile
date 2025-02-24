# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /Backend

# Copy package.json and package-lock.json for dependency installation
COPY src/package*.json ./

# Install the dependencies
RUN npm cache clean --force && npm install --legacy-peer-deps

# Install PostgreSQL client utilities
RUN apk update && apk add --no-cache postgresql-client bash 

# Copy the rest of the application code (including the wait-for-it script)
COPY . .

# Set environment variables
ENV PG_DATABASE_URL=postgres://paras:1224@localhost:5432/postgres
ENV DATABASE=CaterOrangeDB
ENV DATABASE_URL=postgres://paras:1224@localhost:5432/CaterOrangeDB
ENV PORT=4000
ENV SECRET_KEY=CaterOrange
ENV GMAIL_USER=sirisha@scaleorange.com
ENV GMAIL_PASS=ptbh\ wcoi\ mvnu\ fydh
ENV RAZORPAY_KEY_ID=rzp_live_L9ioBuAQZXSBDm
ENV RAZORPAY_SECRET=Q4ndGVbSbNHtXclcYEmWq3EK
ENV MIXPANEL_TOKEN=cb19042cf789f9c44e059bd4be6f2c5d
# Expose the port that the app runs on
EXPOSE 4000

# Command to run the app, waiting for the database to be ready first
CMD ["npm", "start"]
