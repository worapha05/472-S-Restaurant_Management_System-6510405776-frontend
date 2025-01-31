FROM oven/bun:1

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies using bun
RUN bun install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN bun run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["bun", "run", "dev"]