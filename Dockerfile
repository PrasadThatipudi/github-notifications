# Use official Node.js LTS image

FROM denoland/deno:latest

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Run the Deno app (update entrypoint if needed)
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "server.js"]
