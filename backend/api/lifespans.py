import logging
from message.connection import RabbitMQConnection
from fastapi import FastAPI
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from deps import environ


# Initialize RabbitMQ connection handler
rabbitmq = RabbitMQConnection()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    FastAPI lifespan context manager for handling RabbitMQ connection
    """
    # Startup: establish RabbitMQ connection
    if not rabbitmq.connect(environ.rabbitmq_url):
        logger.critical(
            "Failed to establish RabbitMQ connection. Shutting down.")
        raise SystemExit(1)

    try:
        yield
    finally:
        # Shutdown: close RabbitMQ connection
        rabbitmq.close()
