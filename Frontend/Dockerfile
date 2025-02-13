FROM node:20-alpine


# Set the working directory
WORKDIR /Frontend

# Copy package files
COPY package*.json ./

# Clear npm cache and increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies with specific flags to handle common issues
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-package-lock --network-timeout=100000

# Copy the rest of the application code
COPY . .

ENV REACT_APP_URL=https://dev.caterorange.com

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
