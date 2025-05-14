# 📁 File Sharing and Processing Platform

This is a cloud-native file sharing and processing web application developed as part of the CS436 – Cloud Computing Term Project. It allows users to upload, list, and delete files on Google Cloud Storage, with metadata stored in PostgreSQL. The platform is deployed using Docker containers on GKE (Google Kubernetes Engine), with additional functionality provided via Cloud Functions.

---

## 🌐 Live Deployment

* **Frontend URL:** http\://<frontend-external-ip>
* **Backend URL:** http\://<backend-external-ip>

*Replace with actual IPs from your `kubectl get services` output.*

---

## ✅ Features

* File upload to Google Cloud Storage
* Metadata storage in PostgreSQL (hosted on GCP VM)
* File listing and deletion
* Sorting and filtering options
* Cloud Function trigger on upload
* Fully containerized with Docker
* GKE deployment (Frontend & Backend)
* Performance tested with Locust

---

## ⚙️ System Architecture

* **Frontend:** React app deployed on GKE (Docker container)
* **Backend:** Express.js server deployed on GKE (Docker container)
* **Database:** PostgreSQL running on a Compute Engine VM (port 5432 open)
* **Storage:** Google Cloud Storage (GCS) bucket for file storage
* **Trigger:** Cloud Function triggered on file upload (Eventarc)

---

## 🚀 Deployment Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cs436-file-platform.git
cd cs436-file-platform
```

### 2. Set up `.env` (backend)

Create a `.env` file inside `backend/`:

```env
PG_HOST=<your-vm-external-ip>
PG_USER=<your-db-username>
PG_PASSWORD=<your-password>
PG_DATABASE=file_platform_db
```

Also place your GCS service account key as `gcs-key.json`.

### 3. Docker Build & Push

```bash
# Backend
cd backend
docker build -t file-backend .
docker tag file-backend us-central1-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPO/file-backend
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPO/file-backend

# Frontend
cd ../frontend
docker build -t file-frontend .
docker tag file-frontend us-central1-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPO/file-frontend
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPO/file-frontend
```

### 4. Kubernetes Deploy

```bash
kubectl apply -f k8s/file-backend-deployment.yaml
kubectl apply -f k8s/file-frontend-deployment.yaml
```

---

## ⚡ Performance Testing with Locust

### 1. Install Locust

```bash
pip install locust
```

### 2. Run Locust test

```bash
locust --host=http://<backend-external-ip>
```

### 3. Open Locust UI

Go to: [http://localhost:8089](http://localhost:8089)
Enter number of users and spawn rate, then click **START**.

### 🔬 Sample test script (`locustfile.py`)

```python
from locust import HttpUser, task, between

class FileUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def list_files(self):
        self.client.get("/files")
```

---

## 🧪 Kubernetes Resources

The `k8s/` folder contains deployment files:

* `file-backend-deployment.yaml` → Deploys backend with LoadBalancer
* `file-frontend-deployment.yaml` → Deploys frontend with LoadBalancer

---

## 💰 Cost and Budget

* All services deployed under GCP’s **\$300 free tier**
* PostgreSQL hosted on a VM with firewall + authentication
* GCS for file storage with lifecycle rules
* Cloud Function is event-driven and billed per use
* Artifact Registry used to store container images

---



