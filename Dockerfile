FROM node:20-bookworm

# Install PostgreSQL
RUN apt-get update && \
    apt-get install -y postgresql postgresql-client sudo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
ENV PATH="$PATH:/usr/lib/postgresql/15/bin"

# Initialize PostgreSQL data directory
RUN mkdir -p /var/lib/postgresql/data /var/run/postgresql /var/log && \
    chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql /var/log && \
    su postgres -c "initdb -D /var/lib/postgresql/data" && \
    echo "host all all 0.0.0.0/0 trust" >> /var/lib/postgresql/data/pg_hba.conf && \
    echo "local all all trust" >> /var/lib/postgresql/data/pg_hba.conf && \
    echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
ENV JWT_SECRET="orgflow_jwt_secret_key_2024_secure"
ENV NEXT_TELEMETRY_DISABLED=1

# Start PostgreSQL temporarily for the build (Next.js may try to connect during build)
RUN su postgres -c "pg_ctl -D /var/lib/postgresql/data -l /tmp/pg.log start" && \
    sleep 3 && \
    su postgres -c "createdb app_db" && \
    su postgres -c "psql -d app_db -f /app/init.sql" && \
    npm run build && \
    su postgres -c "pg_ctl -D /var/lib/postgresql/data stop"

# Copy the startup script and make it executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 7860

CMD ["/app/start.sh"]
