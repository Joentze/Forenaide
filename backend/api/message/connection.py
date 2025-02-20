import logging
import pika

logger = logging.getLogger(__name__)


class RabbitMQConnection:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.default_queues = [
            "extraction"
        ]

    def connect(self, host: str = 'localhost', port: int = 5672,
                username: str = 'guest', password: str = 'guest',
                virtual_host: str = '/', heartbeat: int = 60) -> bool:
        """
        Establish connection to RabbitMQ server with a heartbeat
        Returns True if connection is successful, False otherwise
        """
        try:
            # Create connection parameters
            credentials = pika.PlainCredentials(username, password)
            parameters = pika.ConnectionParameters(
                host=host,
                port=port,
                virtual_host=virtual_host,
                credentials=credentials,
                connection_attempts=3,
                retry_delay=5,
                heartbeat=heartbeat
            )

            # Establish connection
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()

            # Test connection by declaring a test queue
            for queue in self.default_queues:
                self.channel.queue_declare(queue=queue, durable=True)

            logger.info("Successfully connected to RabbitMQ")
            return True

        except pika.exceptions.AMQPConnectionError as error:
            logger.error(f"Failed to connect to RabbitMQ: {error}")
            return False
        except Exception as error:
            logger.error(
                f"Unexpected error while connecting to RabbitMQ: {error}")
            return False

    def close(self):
        """
        Close RabbitMQ connection and channel
        """
        try:
            if self.channel:
                self.channel.close()
            if self.connection:
                self.connection.close()
            logger.info("RabbitMQ connection closed successfully")
        except Exception as error:
            logger.error(f"Error closing RabbitMQ connection: {error}")

    def publish_message(self, queue_name: str, message: str) -> bool:
        """
        Publish a message to a specified RabbitMQ queue
        Returns True if the message is published successfully, False otherwise
        """
        try:
            if not self.channel:
                logger.error("Cannot publish message, no open channel")
                return False

            self.channel.basic_publish(
                exchange='',
                routing_key=queue_name,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # make message persistent
                )
            )
            logger.info(f"Message published to queue {queue_name}")
            return True

        except Exception as error:
            logger.error(f"""Failed to publish message to queue {
                         queue_name}: {error}""")
            return False
