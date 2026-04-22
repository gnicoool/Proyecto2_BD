FROM postgres:16-alpine

COPY init.sql /docker-entrypoint-initdb.d/01-init.sql
COPY populete.sql /docker-entrypoint-initdb.d/02-populete.sql

EXPOSE 5432
