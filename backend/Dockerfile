FROM node:20-alpine

WORKDIR /app/

# Copy package files
COPY backend/package*.json /app/

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ /app/

# Copy compiled contracts from build context
COPY build /app/build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Install curl for health check
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]
