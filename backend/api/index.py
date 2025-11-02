# Vercel serverless function entry point
# This file is required for Vercel to run FastAPI

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

# Export app for Vercel
__all__ = ['app']

