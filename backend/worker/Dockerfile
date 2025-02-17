# TODO: find a way to reduce the size of docker container

FROM python:3.12
 
 
COPY requirements.txt /requirements.txt

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin/:$PATH"

RUN uv pip install --system --no-cache -r requirements.txt
 
RUN apt-get update && apt-get install -y \
    wget \
    tar \
    cmake \
    libnss3 \
    libnss3-dev \
    libcairo2-dev \
    libjpeg-dev \
    libgif-dev \
    cmake \
    libblkid-dev \
    e2fslibs-dev \
    libboost-all-dev \
    libaudit-dev \
    libopenjp2-7-dev \
    g++  # Aggiunto il pacchetto g++

RUN wget https://poppler.freedesktop.org/poppler-21.09.0.tar.xz \
    && tar -xvf poppler-21.09.0.tar.xz \
    && cd poppler-21.09.0 \
    && mkdir build \
    && cd build \
    && cmake -DCMAKE_BUILD_TYPE=Release \
             -DCMAKE_INSTALL_PREFIX=/usr \
             -DTESTDATADIR=$PWD/testfiles \
             -DENABLE_UNSTABLE_API_ABI_HEADERS=ON \
             .. \
    && make \
    && make install

COPY . .
 
CMD ["python", "main.py"]