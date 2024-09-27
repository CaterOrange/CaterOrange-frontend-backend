#!/usr/bin/env bash
# wait-for-it.sh
# Waits for the database service to be ready before proceeding.

host="$1"
shift
cmd="$@"

# Check if host is provided
if [[ -z "$host" ]]; then
  echo "Usage: $0 host:port command"
  exit 1
fi

# Loop until the database is ready
until pg_isready -h "$host" -p 5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
