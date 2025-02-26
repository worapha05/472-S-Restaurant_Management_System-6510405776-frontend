FROM oven/bun:1

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies using bun
RUN bun install

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application in development mode
CMD ["bun", "run", "dev"]