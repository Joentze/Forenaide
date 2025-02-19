import logging
from classes.environ import Environ
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
    environ = Environ()
    if not rabbitmq.connect(
        host=environ.rabbitmq_host,
        port=environ.rabbitmq_port
    ):
        logger.critical(
            "Failed to establish RabbitMQ connection. Shutting down.")
        raise SystemExit(1)
    rabbitmq.close()
    try:
        yield
    finally:
        # Shutdown: close RabbitMQ connection
        rabbitmq.close()
