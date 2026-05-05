FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy workspace files
COPY ./. ..
COPY ./artifacts/api-server ./artifacts/api-server
COPY ./lib ./lib

# Build the application
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["pnpm", "run", "start"]
