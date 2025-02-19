FROM supabase/edge-runtime:v1.67.2

# Set the working directory
WORKDIR /app

# Copy the functions directory to /examples in the container
COPY ./functions /examples

# Copy the environment file to the working directory
COPY .env /app/.env

# Expose the port that the service will run on
EXPOSE 9000

# Command to run the service
# TODO: RUN COMMAND
