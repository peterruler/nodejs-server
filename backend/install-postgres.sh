#!/bin/bash
docker run --name nodejs-server-db -e POSTGRES_DB=issuetracker -e POSTGRES_PASSWORD=foobert99 -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres