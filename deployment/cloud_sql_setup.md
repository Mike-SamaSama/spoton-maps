# Cloud SQL Setup Guide

This guide walks through setting up a PostgreSQL instance on Google Cloud SQL for production deployment.

## Prerequisites

- Google Cloud Project with billing enabled
- `gcloud` CLI installed and authenticated
- PostgreSQL client tools (optional, for local testing)

## 1. Create Cloud SQL Instance

```bash
gcloud sql instances create spoton-maps-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --no-assign-ip \
  --availability-type=REGIONAL
```

## 2. Create Database and User

```bash
gcloud sql databases create spoton_maps \
  --instance=spoton-maps-db

gcloud sql users create spoton_user \
  --instance=spoton-maps-db \
  --password=YOUR_SECURE_PASSWORD
```

## 3. Get Connection String

```bash
gcloud sql instances describe spoton-maps-db \
  --format='value(ipAddresses[0].ipAddress)'
```

Use this format for your DATABASE_URL:
```
postgresql://spoton_user:YOUR_PASSWORD@INSTANCE_IP:5432/spoton_maps
```

## 4. Configure Private IP (Recommended)

```bash
gcloud sql instances patch spoton-maps-db \
  --network=default \
  --no-assign-ip
```

## 5. Set Up Cloud SQL Proxy for Local Testing

```bash
# Download Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.windows.386.exe

# Run proxy
cloud_sql_proxy -instances=PROJECT_ID:us-central1:spoton-maps-db=tcp:5432
```

Then connect with:
```
postgresql://spoton_user:YOUR_PASSWORD@localhost:5432/spoton_maps
```

## 6. Run Migrations

```bash
export DATABASE_URL="postgresql://spoton_user:YOUR_PASSWORD@INSTANCE_IP:5432/spoton_maps"
npm run migrate
npm run seed
```

## 7. Cleanup

To delete the instance (WARNING: deletes all data):
```bash
gcloud sql instances delete spoton-maps-db
```

## Monitoring

```bash
# Check instance status
gcloud sql instances describe spoton-maps-db

# View logs
gcloud sql operations list --instance=spoton-maps-db

# Connect via Cloud SQL Proxy
psql -h localhost -U spoton_user -d spoton_maps
```
