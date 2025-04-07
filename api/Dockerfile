# Use a Python base image
FROM python:3

# Install OpenGL libraries
RUN apt-get update && apt-get install -y libgl1

# Set the working directory in the container
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --upgrade pip

# Copy your application code
COPY . .

# Expose the port your Flask app will run on
EXPOSE 6000

# Run the Flask application
CMD ["python", "app.py"]