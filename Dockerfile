# Use the official Node.js 18 image as a builder
FROM node:18 AS builder

# Set the working directory to /app
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Use a smaller Node.js 18 image for production
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the app files and dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port 3000
EXPOSE 3000

# Start the app with migrations in production
CMD ["npm", "run", "start:migrate:prod"]