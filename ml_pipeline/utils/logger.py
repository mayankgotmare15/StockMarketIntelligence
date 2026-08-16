"""
Structured Logging utility for Real-Time Indian Stock Market Intelligence Platform.
Provides clean console output with formatting and file logging capabilities.
"""

import logging
import sys
from pathlib import Path

# Create logs directory
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "stock_intelligence.log"


def setup_logger(name: str = "StockIntelligence", log_level: str = "INFO") -> logging.Logger:
    """Configures and returns a structured logger."""
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers if already configured
    if logger.hasHandlers():
        return logger

    level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(level)

    # Console Handler with human-friendly format
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File Handler for complete audit trail
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    return logger


# Default application logger
app_logger = setup_logger()
