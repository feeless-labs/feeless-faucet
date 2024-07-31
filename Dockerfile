# Step 1: Use the official Nginx image as the base image
FROM nginx:stable-alpine

# Step 2: Set a working directory (optional)
WORKDIR /usr/share/nginx/html

# Step 3: Remove the default Nginx static assets
RUN rm -rf ./*

# Step 4: Copy the static build directory contents to the Nginx container
COPY ./dist .


# Step 6: Expose port 80 to the outside once the container launches
EXPOSE 80

# Step 7: Start Nginx and ensure it stays running
CMD ["nginx", "-g", "daemon off;"]
