import pika
from typing import Optional, Callable
import logging


class RabbitMQConsumer:
    """A context manager for handling RabbitMQ message consumption using Pika."""

    def __init__(
        self,
        host: str = 'localhost',
        port: int = 5672,
        virtual_host: str = '/',
        username: str = 'guest',
        password: str = 'guest',
        queue_name: Optional[str] = None,
        exchange_name: Optional[str] = None,
        routing_key: Optional[str] = None,
        exchange_type: str = 'direct',
        prefetch_count: int = 1,
        durable: bool = True
    ):
        """
        Initialize the RabbitMQ consumer with connection parameters.

        Args:
            host: RabbitMQ server hostname
            port: RabbitMQ server port
            virtual_host: Virtual host to connect to
            username: RabbitMQ username
            password: RabbitMQ password
            queue_name: Name of the queue to consume from
            exchange_name: Name of the exchange to bind to
            routing_key: Routing key for binding queue to exchange
            exchange_type: Type of exchange ('direct', 'fanout', 'topic', 'headers')
            prefetch_count: Number of messages to prefetch
            durable: Whether the queue should survive broker restarts
        """
        self.credentials = pika.PlainCredentials(username, password)
        self.parameters = pika.ConnectionParameters(
            host=host,
            port=port,
            virtual_host=virtual_host,
            credentials=self.credentials
        )
        self.queue_name = queue_name
        self.exchange_name = exchange_name
        self.routing_key = routing_key
        self.exchange_type = exchange_type
        self.prefetch_count = prefetch_count
        self.durable = durable
        self.connection: Optional[pika.SelectConnection] = None
        self.channel: Optional[pika.channel.Channel] = None
        self.logger = logging.getLogger(__name__)

    def __enter__(self):
        """Establish connection and channel when entering context."""
        try:
            self.connection = pika.BlockingConnection(self.parameters)
            self.channel = self.connection.channel()

            # Set QoS
            self.channel.basic_qos(prefetch_count=self.prefetch_count)

            # Declare exchange if specified
            if self.exchange_name:
                self.channel.exchange_declare(
                    exchange=self.exchange_name,
                    exchange_type=self.exchange_type,
                    durable=self.durable
                )

            # Declare queue and bind to exchange if specified
            if self.queue_name:
                self.channel.queue_declare(
                    queue=self.queue_name,
                    durable=self.durable
                )

                if self.exchange_name:
                    self.channel.queue_bind(
                        queue=self.queue_name,
                        exchange=self.exchange_name,
                        routing_key=self.routing_key
                    )

            return self
        except Exception as e:
            self.logger.error(f"Error setting up RabbitMQ consumer: {str(e)}")
            self.__exit__(type(e), e, e.__traceback__)
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up resources when exiting context."""
        try:
            if self.channel and not self.channel.is_closed:
                self.channel.close()
            if self.connection and not self.connection.is_closed:
                self.connection.close()
        except Exception as e:
            self.logger.error(f"Error cleaning up RabbitMQ consumer: {str(e)}")

    def consume(self, callback: Callable[[pika.spec.Basic.Deliver, pika.spec.BasicProperties, bytes], None]):
        """
        Start consuming messages from the queue.

        Args:
            callback: Function to process received messages
        """
        if not self.channel or self.channel.is_closed:
            raise RuntimeError("Channel is not open")

        self.channel.basic_consume(
            queue=self.queue_name,
            on_message_callback=callback,
            auto_ack=False
        )

        try:
            self.logger.info(f"""Starting to consume from queue: {
                             self.queue_name}""")
            self.channel.start_consuming()
        except KeyboardInterrupt:
            self.logger.info("Stopping consumer...")
            self.channel.stop_consuming()
        except Exception as e:
            self.logger.error(f"Error during consumption: {str(e)}")
            raise

# Example usage:


# Using the context manager
if __name__ == "__main__":
    # with RabbitMQConsumer(
    #     host='localhost',
    #     queue_name='my_queue',
    #     exchange_name='my_exchange',
    #     routing_key='my_routing_key'
    # ) as consumer:
    #     consumer.consume(process_message)
    pass
