FROM node:18-alpine
WORKDIR /Frontend
COPY package*.json ./
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install react-scripts -g
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
