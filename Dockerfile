FROM node:6.1.0

ARG VERSION
ENV ipfs_host ipfs
ENV ipfs_port 5001

RUN mkdir /antaeus
WORKDIR /antaeus

RUN npm install -g antaeus@${VERSION}

EXPOSE 3000

CMD antaeus start --port 3000 --ipfsHost $ipfs_host --ipfsPort $ipfs_port
