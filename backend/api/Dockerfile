# TODO: find a way to reduce the size of docker container

FROM python:3.12

COPY ./api/requirements.txt /requirements.txt

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin/:$PATH"

RUN uv pip install --system --no-cache -r requirements.txt

WORKDIR /api

# Ensure only the necessary files are copied
COPY ./api /api

CMD ["python", "/api/app.py"]
