FROM node:20-alpine

WORKDIR /app

# Install yarn if not included in the base image
RUN apk add --no-cache yarn

# Copy package files and lockfile
COPY package.json yarn.lock* ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Make sure Next.js binds to all interfaces
CMD ["yarn", "dev"]