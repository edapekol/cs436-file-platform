from locust import HttpUser, task, between
import random
import string

def generate_filename():
    return ''.join(random.choices(string.ascii_lowercase, k=8)) + ".txt"

class FilePlatformUser(HttpUser):
    wait_time = between(1, 2)

    @task(2)
    def list_files(self):
        with self.client.get("/files", name="List Files", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"GET /files failed with status {response.status_code}")

    @task(1)
    def upload_file(self):
        filename = generate_filename()
        content = b"This is a test file content from Locust.\n" * 10  # Simulate larger file
        files = {"file": (filename, content)}

        with self.client.post("/upload", files=files, name="Upload File", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"POST /upload failed with status {response.status_code}")

