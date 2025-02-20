"""
create dependencies
"""
from message.connection import RabbitMQConnection
from typing import Annotated
from fastapi import Depends
from classes.environ import Environ
from supabase import create_async_client, AsyncClient
import dotenv

dotenv.load_dotenv()


environ = Environ()

url: str = environ.supabase_url
key: str = environ.supabase_key

# Raise error if URL or Key is missing
if not url or not key:
    raise ValueError("Supabase URL and Key must be provided in the .env file")


async def provide_client():
    """
    supabase client dependencies
    """
    return await create_async_client(url, key)


async def provide_rabbitmq_client():
    """
    rabbitmq client dependencies
    """
    return RabbitMQConnection()


async def provide_environ():
    """
    provide environ
    """
    return Environ()

EnvironDeps = Annotated[Environ, Depends(provide_environ)]

RabbitMQDeps = Annotated[RabbitMQConnection, Depends(provide_rabbitmq_client)]

SBaseDeps = Annotated[AsyncClient, Depends(provide_client)]
