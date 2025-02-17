# Run time environment
FROM node:22 as builder

# Set the working directory
WORKDIR /usr/src/app

# Copy everything to working directory
COPY . .

# Install dependencies 
RUN npm install

# Run the build command
RUN npm run build

# Debug list files in work dir
RUN  ls -la /usr/src/app

# Set development stage
FROM builder as development

ENV NODE_ENV=development

# Expose the port 3000
EXPOSE 3000

CMD ["npm","start"]


# # Set production stage
# FROM builder as production

# ENV NODE_ENV=production

# # The production start command
# CMD ["npm","start"]