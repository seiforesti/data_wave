### === backend/app/core/config.py ===
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AUTH_TYPE = os.getenv("AUTH_TYPE")
    TENANT_ID = os.getenv("TENANT_ID")
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")
    PURVIEW_NAME = os.getenv("PURVIEW_NAME")
    MAX_SCAN_ROWS = int(os.getenv("MAX_SCAN_ROWS", 150))
    ENABLE_CLASSIFICATION = os.getenv("ENABLE_CLASSIFICATION", "true").lower() == "true"
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost:3306/pursightdb")

settings = Settings()