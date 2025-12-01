# Cloud Tasks Setup Guide

This guide walks through setting up Google Cloud Tasks for production token refresh scheduling.

## Prerequisites

- Google Cloud Project with Cloud Tasks API enabled
- Service account with Cloud Tasks Enqueuer and Cloud Run Invoker roles
- Cloud KMS setup for encryption (see below)

## 1. Enable APIs

```bash
gcloud services enable cloudtasks.googleapis.com
gcloud services enable cloudkms.googleapis.com
gcloud services enable run.googleapis.com
```

## 2. Create Cloud KMS Key

```bash
# Create key ring
gcloud kms keyrings create spoton-maps-keys \
  --location=us-central1

# Create encryption key
gcloud kms keys create encryption-key \
  --location=us-central1 \
  --keyring=spoton-maps-keys \
  --purpose=encryption
```

## 3. Create Cloud Tasks Queue

```bash
gcloud tasks queues create token-refresh-queue \
  --location=us-central1
```

## 4. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create spoton-tasks-runner \
  --display-name="Spot On Maps Tasks Runner"

# Grant Cloud Tasks Enqueuer role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:spoton-tasks-runner@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/cloudtasks.enqueuer

# Grant Cloud Run Invoker role (for calling worker)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:spoton-tasks-runner@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.invoker
```

## 5. Deploy Refresh Worker to Cloud Run

```bash
gcloud run deploy spoton-refresh-worker \
  --source=. \
  --entry-point=workers/refresh-worker.js \
  --runtime=nodejs18 \
  --region=us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars="GOOGLE_CLIENT_ID=YOUR_CLIENT_ID,GOOGLE_CLIENT_SECRET=YOUR_SECRET,DATABASE_URL=YOUR_DB_URL"
```

## 6. Configure Environment Variables

Update your `.env` or Cloud Run environment with:

```bash
# Cloud Tasks
GCP_PROJECT=your-project-id
CLOUD_TASKS_LOCATION=us-central1
CLOUD_TASKS_QUEUE=token-refresh-queue
WORKER_BASE_URL=https://spoton-refresh-worker-xxx.run.app
GCP_SERVICE_ACCOUNT_EMAIL=spoton-tasks-runner@PROJECT_ID.iam.gserviceaccount.com

# Cloud KMS
CLOUD_KMS_PROJECT=your-project-id
CLOUD_KMS_LOCATION=us-central1
CLOUD_KMS_KEYRING=spoton-maps-keys
CLOUD_KMS_KEY=encryption-key
USE_CLOUD_KMS=true
```

## 7. Verify Setup

```bash
# List queues
gcloud tasks queues list --location=us-central1

# Check service account permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:spoton-tasks-runner*"

# View KMS keys
gcloud kms keys list \
  --location=us-central1 \
  --keyring=spoton-maps-keys
```

## 8. Test Task Creation

```bash
# Use the /enqueue-refresh endpoint
curl -X POST http://localhost:3000/enqueue-refresh \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "test-token-id"}'
```

## Troubleshooting

- **Task fails to invoke worker**: Check service account has Cloud Run Invoker role
- **KMS decryption fails**: Verify KMS key exists and service account has permissions
- **Tasks not appearing**: Check queue exists and CLOUD_TASKS_QUEUE name matches

## Cleanup

```bash
# Delete resources
gcloud run services delete spoton-refresh-worker --region=us-central1
gcloud tasks queues delete token-refresh-queue --location=us-central1
gcloud kms keys versions destroy 1 \
  --key=encryption-key \
  --keyring=spoton-maps-keys \
  --location=us-central1
gcloud iam service-accounts delete spoton-tasks-runner@PROJECT_ID.iam.gserviceaccount.com
```
