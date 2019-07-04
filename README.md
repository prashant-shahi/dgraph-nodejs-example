# Dgraph NodeJS Example

## Overview

This project is an example project for [Dgraph-js](https://github.com/dgraph-io/dgraph-js). There are 2 nodes - **User node** and **Company node** with edges `works.for` and `connection`.


## Getting started

Using [Docker Compose](https://docs.docker.com/compose/install/), we can quickly get started.

```sh
# Cloning the repository
git clone https://github.com/prashant-shahi/dgraph-nodejs-example

# Changing the directory
cd dgraph-nodejs-example

# (Optional) You can skip image building by pulling the image from DockerHub
docker-compose pull

# Building needed images and running those containers
docker-compose up
```


## Endpoints

|API|Functionality|Remarks|
|---|---|---|
|`/`|Checking server status|Returns status *success* with the response *server up*, if server is successfully up.|
|`/clear`|Clears all the data present in Dgraph|With no data present, schema automatically clears off.|
|`/load-data`|Loads the sample data in Dgraph|Clears data, alters the schema, and, perform mutation to add the sample data.|
|`/query`|Querying for data in Dgraph|Existing child nodes to one level nested ones are also included.|


## Screenshots

### Result data of /query API endpoint

![](https://i.imgur.com/ZExGdc6.jpg)

### Ratel UI for query

![](https://i.imgur.com/MY8bbt9.jpg)