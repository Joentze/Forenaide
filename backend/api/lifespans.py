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
    yield
