const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());

const gcs = new Storage({
  keyFilename: path.join(__dirname, "gcs-key.json"),
});

const bucketName = "file-platform-bucket"; // ← senin bucket adın
const bucket = gcs.bucket(bucketName);

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;
  const blob = bucket.file(file.name);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    console.error("GCS Upload Error:", err);
    res.status(500).send("Upload to GCS failed.");
  });

  blobStream.on("finish", () => {
    res.send({ message: "File uploaded to GCS successfully!" });
  });

  blobStream.end(file.data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
