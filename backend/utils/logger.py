import sys
import os
from loguru import logger as _logger

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Configure logger once at module load time
_logger.remove()
_logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{extra[name]}</cyan> - <level>{message}</level>",
    level="INFO",
)
_logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="7 days",
    level="DEBUG",
    format="{time} | {level} | {extra[name]} - {message}",
)


def get_logger(name: str):
    """Returns a loguru logger bound with the module name."""
    return _logger.bind(name=name)
