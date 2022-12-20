#!/bin/bash

# Run the yarn dev command in the background
yarn dev &

# Save the PID of the yarn dev process
yarn_dev_pid=$!

# Open a new Firefox window and navigate to the specified URL in the background
firefox http://localhost:8420 &

# Save the PID of the Firefox process
firefox_pid=$!

# Define a signal handler function to be executed when the SIGINT signal is received
signal_handler() {
  echo "Received SIGINT signal, terminating yarn dev and Firefox..."
  kill $yarn_dev_pid
  kill $firefox_pid
}

# Set the signal handler for the SIGINT signal
trap signal_handler SIGINT

# Wait indefinitely
while true; do
  sleep 1
done
