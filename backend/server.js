require("dotenv").config();

const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const pool = require("./db"); // ← db.js dosyan olmalı

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.json());

// GCS ayarı
const gcs = new Storage({
  keyFilename: path.join(__dirname, "gcs-key.json"),
});

const bucketName = "file-platform-bucket";
const bucket = gcs.bucket(bucketName);

// Upload endpoint’i
app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;
  const blob = bucket.file(file.name);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    console.error("GCS Upload Error:", err);
    return res.status(500).send("Upload to GCS failed.");
  });

  blobStream.on("finish", async () => {
    const uploadedAt = new Date();

    try {
      // Veritabanına metadata kaydı
      await pool.query(
        "INSERT INTO uploads (filename, uploaded_at) VALUES ($1, $2)",
        [file.name, uploadedAt]
      );
      res.send({ message: "Dosya GCS'ye ve veritabanına yüklendi ✅" });
    } catch (err) {
      console.error("DB Error:", err);
      res.status(500).send("Veritabanına kayıt yapılamadı ❌");
    }
  });

  blobStream.end(file.data);
});

// Test endpoint’i — veritabanı bağlantısını doğrulamak için
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Veritabanı bağlantısı başarılı ✅ ${result.rows[0].now}`);
  } catch (err) {
    console.error("DB Test Error:", err);
    res.status(500).send("Veritabanı bağlantısı başarısız ❌");
  }
});

app.get("/files", async (req, res) => {
  const sort = req.query.sort || "name"; // varsayılan: isme göre
  const order = req.query.order === "desc" ? "desc" : "asc"; // varsayılan: asc

  try {
    const [files] = await bucket.getFiles();

    // Metadata’yı çekmek için tüm dosyaların bilgilerini zenginleştiriyoruz
    const enrichedFiles = await Promise.all(
      files.map(async (file) => {
        await file.getMetadata();
        return {
          name: file.name,
          publicUrl: `https://storage.googleapis.com/${bucketName}/${file.name}`,
          timeCreated: new Date(file.metadata.timeCreated),
          size: parseInt(file.metadata.size || "0")
        };
      })
    );

    // Sıralama
    enrichedFiles.sort((a, b) => {
      if (sort === "date") {
        return order === "asc"
          ? a.timeCreated - b.timeCreated
          : b.timeCreated - a.timeCreated;
      } else if (sort === "size") {
        return order === "asc"
          ? a.size - b.size
          : b.size - a.size;
      } else {
        // name
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    res.json(enrichedFiles);
  } catch (err) {
    console.error("GCS List Error:", err);
    res.status(500).send("Dosyalar listelenemedi.");
  }
});


app.delete("/files/:filename", async (req, res) => {
  const filename = req.params.filename;

  try {
    // 1. GCS'den dosyayı sil
    await bucket.file(filename).delete();

    // 2. Veritabanından kaydı sil
    await pool.query("DELETE FROM uploads WHERE filename = $1", [filename]);

    res.send({ message: `${filename} başarıyla silindi ✅` });
  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).send({ error: "Dosya silinemedi ❌" });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
