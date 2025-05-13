const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
const path = require("path");

app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.static("uploads")); // Yüklenen dosyaları statik servis eder

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;
  const uploadPath = path.join(__dirname, "uploads", file.name);

  file.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);
    res.send({ message: "File uploaded successfully." });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
