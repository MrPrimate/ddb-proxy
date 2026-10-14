# Dockerized version of the ddb-proxy

This dockerfile allows you to run ddb-proxy in docker container.

## Building

To build the container, run this from the repository root (not the `docker` folder):

`docker build -f docker/dockerfile -t ddb-proxy .`

The image runs Node 24 on Alpine 3.24 and is published for `linux/amd64` and `linux/arm64`. 32-bit ARM (for example a Raspberry Pi running a 32-bit OS) is no longer supported because Node 24 has no 32-bit ARM Alpine image; run the proxy directly with Node there, or switch to a 64-bit OS.

## Running

To run previosly built container and expose it on port 3000 of your machine run:

`docker run -p 3000:3000 ddb-proxy:latest`

## Running prebuilt image

This repository also builds newest version of the proxy automatically. You may start it with following command:

`docker run -p 3000:3000 ghcr.io/mrprimate/ddb-proxy:latest`


## Security considerations

Above command exposed your proxy to the world with unsecured connections.
If you run this on VPS, make sure that you secure the connection via reverse proxy.
Check [docker-compose.yml](docker-compose.yml) file for suggested secure configuration with [jwilder's nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and letsencrypt.

To start docker-compose use command:

`docker-compose up -d`
