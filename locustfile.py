from locust import HttpUser, task, between
import random
import string

def generate_filename():
    return ''.join(random.choices(string.ascii_lowercase, k=8)) + ".txt"

class FilePlatformUser(HttpUser):
    wait_time = between(1, 2)

    @task(2)
    def list_files(self):
        self.client.get("/files")

    @task(1)
    def upload_file(self):
        filename = generate_filename()
        content = b"This is test file content from Locust."
        files = {"file": (filename, content)}
        self.client.post("/upload", files=files)
