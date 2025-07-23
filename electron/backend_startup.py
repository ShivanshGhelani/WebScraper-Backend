import uvicorn
import sys
import os

# Add the backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
sys.path.insert(0, backend_dir)

# Import the FastAPI app from the backend directory
from main import app

if __name__ == "__main__":
    # Run the FastAPI app with Uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        access_log=False,  # Disable access logs for cleaner output
        server_header=False,  # Remove server header
        date_header=False  # Remove date header
    )
