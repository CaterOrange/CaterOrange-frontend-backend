# Use the official Node.js image as the base image
FROM node:20-alpine3.18

# Set the working directory inside the container
WORKDIR /Backend

# Copy package.json and package-lock.json for dependency installation
COPY src/package*.json ./

# Install the dependencies
RUN npm install


# Install PostgreSQL client utilities
RUN apk update && apk add --no-cache postgresql-client bash # Copy the rest of the application code (including the wait-for-it script)
COPY . .


ENV PG_DATABASE_URL=postgres://paras:1224@localhost:5432/postgres
ENV DATABASE=CaterOrangeDB
ENV DATABASE_URL=postgres://paras:1224@localhost:5432/CaterOrangeDB
ENV PORT=4000
ENV SECRET_KEY=CaterOrange
ENV GMAIL_USER=sirisha@scaleorange.com
ENV GMAIL_PASS=ptbh\ wcoi\ mvnu\ fydh

ENV RAZORPAY_KEY_ID=rzp_live_L9ioBuAQZXSBDm
ENV RAZORPAY_SECRET=Q4ndGVbSbNHtXclcYEmWq3EK

# Expose the port that the app runs on
EXPOSE 4000

# Command to run the app, waiting for the database to be ready first
CMD ["npm", "start"]


# docker run --name CO-postgres-db -
#     e POSTGRES_USER=paras -e POSTGRES_PASSWORD=1224 -e POSTGRES_DB=postgres -p 5435:5432 -d 
#     postgres
#     7e663ae37b3d0121d6d8d8409577935f889c27bf10e98f2ad2f775ab1efc266f

#image name caterorange-bp
# constiner name caterorange-backend-postgresdb
