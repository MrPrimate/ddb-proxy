# Dockerized version of the ddb-proxy

This dockerfile allows you to run ddb-proxy in docker container.

## Building

To build the container run:

`docker build . -t ddb-proxy`

## Running

To run previosly built container and expose it on port 8080 of your machine run:

`docker run ddb-proxy:latest -p 8080:3000`

## Security considerations

Above command exposed your proxy to the world with unsecured connections.
If you run this on VPS, make sure that you secure the connection via reverse proxy.
Check [docker-compose.yml](docker-compose.yml) file for suggested secure configuration with [jwilder's nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and letsencrypt.

To start docker-compose use command:

`docker-compose up -d`
