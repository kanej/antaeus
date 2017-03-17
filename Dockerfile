FROM node:7.7.3

ARG VERSION
ENV IPFS_HOST ipfs
ENV IPFS_PORT 5001
ENV ETCD_ENABLE true
ENV ETCD_URL http://etcd:2379
ENV DNS_CONFIG ''

RUN mkdir /antaeus
WORKDIR /antaeus

RUN npm install -g antaeus@${VERSION}

EXPOSE 3000

CMD antaeus start \
    --port 3000 \
    --ipfsHost $IPFS_HOST \
    --ipfsPort $IPFS_PORT \
    --enableEtcd $ETCD_ENABLE \
    --etcdUrl $ETCD_URL \
    --dnsConfig $DNS_CONFIG
