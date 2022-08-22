FROM node:lts-alpine as builder

RUN apk add --no-cache git python3 build-base

# Create app directory
WORKDIR /opt/app

# Copy basic files for installing dependencies
COPY tsconfig.json tsconfig.build.json package.json package-lock.json ambient.d.ts /opt/app/
COPY src /opt/app/src
COPY config /opt/app/config

RUN npm install

# Build the app
RUN npm run build

FROM node:lts-alpine
RUN apk add --no-cache git python3 g++ make
WORKDIR /opt/app

COPY package.json package-lock.json* /opt/app/

RUN npm ci --production

# Copy of dist directory from builder
COPY --from=builder /opt/app/dist ./dist

# EXPOSE 3000

CMD [ "npm" , "start" ]