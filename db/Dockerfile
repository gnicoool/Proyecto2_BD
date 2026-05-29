FROM postgres:16-alpine

COPY init.sql /docker-entrypoint-initdb.d/01-init.sql
COPY roles.sql /docker-entrypoint-initdb.d/02-roles.sql
COPY stored_procedures.sql /docker-entrypoint-initdb.d/03-stored_procedures.sql
COPY populete.sql /docker-entrypoint-initdb.d/04-populete.sql

EXPOSE 5432
