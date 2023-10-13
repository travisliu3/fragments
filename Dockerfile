# Stage 1: Build the application
FROM node:18.17.0@sha256:c85dc4392f44f5de1d0d72dd20a088a542734445f99bed7aa8ac895c706d370d AS builder

LABEL maintainer="Travis Liu <travisliu3@gmail.com>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable color when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

########################################################################

# Stage 2: Create the production image
FROM node:18.17.0-alpine@sha256:58878e9e1ed3911bdd675d576331ed8838fc851607aed3bb91e25dfaffab3267 AS production

# Copy the built application from the builder stage
COPY --from=builder /app /app

# Use /app as our working directory
WORKDIR /app

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["npm" ,"start"]

# We run our service on port 8080
EXPOSE 8080

# Provide a health check on the server in the container
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost || exit 1
