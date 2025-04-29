FROM postgres:15

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=prisma

EXPOSE 5432

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER || exit 1

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Prisma schema and migration files (if any)
# Uncomment and adjust the following lines if needed:
COPY prisma /app/prisma
WORKDIR /app

# Copy the .env file into the container
COPY .env /app/.env

# Ensure PostgreSQL starts properly and wait for it to be ready before running migrations
CMD ["sh", "-c", "docker-entrypoint.sh postgres & until pg_isready -U $POSTGRES_USER; do sleep 1; done && export $(cat /app/.env | xargs) && npx prisma migrate deploy"]
