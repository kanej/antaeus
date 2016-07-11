FROM node:6.1.0

ARG VERSION
ENV IPFS_HOST ipfs
ENV IPFS_PORT 5001

RUN mkdir /antaeus
WORKDIR /antaeus

RUN npm install -g antaeus@${VERSION}

EXPOSE 3000

CMD antaeus start --port 3000 --ipfsHost $IPFS_HOST --ipfsPort $IPFS_PORT