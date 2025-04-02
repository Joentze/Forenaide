"""
environ variables
"""
from pydantic_settings import BaseSettings


class Environ(BaseSettings):
    """
    base settings for environment variables
    """
    supabase_url: str
    supabase_key: str
    rabbitmq_host: str
    rabbitmq_port: int
