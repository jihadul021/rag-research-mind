import logging
import sys
from pathlib import Path

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console handler
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.INFO)
    console.setFormatter(formatter)

    # File handler — all logs
    file_all = logging.FileHandler(LOG_DIR / "app.log")
    file_all.setLevel(logging.DEBUG)
    file_all.setFormatter(formatter)

    # File handler — errors only
    file_err = logging.FileHandler(LOG_DIR / "error.log")
    file_err.setLevel(logging.ERROR)
    file_err.setFormatter(formatter)

    logger.addHandler(console)
    logger.addHandler(file_all)
    logger.addHandler(file_err)

    return logger