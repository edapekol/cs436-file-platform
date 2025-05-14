import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';

function App() {
  const [fileList, setFileList] = useState([]);
  const [sortOption, setSortOption] = useState({ sort: "name", order: "asc" });

  // Dosya listesini backend'den al
  const fetchFileList = () => {
    const query = `?sort=${sortOption.sort}&order=${sortOption.order}`;

    fetch(`http://localhost:8080/files${query}`)
      .then(res => res.json())
      .then(data => setFileList(data))
      .catch(err => console.error("Dosyalar alınamadı:", err));
  };

  // Sıralama seçimi değiştiğinde listeyi güncelle
  useEffect(() => {
    fetchFileList();
  }, [sortOption]);

  // Dosya silme işlemi
  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm(`${filename} dosyasını silmek istediğine emin misin?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/files/${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(`${filename} başarıyla silindi ✅`);
        fetchFileList();
      } else {
        alert(`${filename} silinemedi ❌`);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Dosya silme sırasında bir hata oluştu.");
    }
  };

  // Yükleme sonrası dosya listesini güncelle
  const getUploadParams = () => {
    return { url: 'http://localhost:8080/upload' };
  };

  const handleChangeStatus = ({ meta }, status) => {
    if (status === 'done') {
      console.log(`${meta.name} uploaded successfully`);
      alert(`${meta.name} başarıyla yüklendi ✅`);
      fetchFileList();
    }
    if (status === 'error_upload') {
      alert(`${meta.name} yüklenemedi ❌`);
    }
  };

  return (
    <div style={{ width: '600px', margin: '50px auto' }}>
      <h2>Dosya Yükleme</h2>

      {/* Sıralama Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="sort-select">Sıralama:</label>
        <select
          id="sort-select"
          value={`${sortOption.sort}-${sortOption.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split("-");
            setSortOption({ sort, order });
          }}
          style={{ marginLeft: '10px', padding: '4px' }}
        >
          <option value="name-asc">Ada göre A–Z</option>
          <option value="name-desc">Ada göre Z–A</option>
          <option value="date-desc">Yüklenme: Yeni → Eski</option>
          <option value="date-asc">Yüklenme: Eski → Yeni</option>
          <option value="size-asc">Boyut: Küçük → Büyük</option>
          <option value="size-desc">Boyut: Büyük → Küçük</option>
        </select>
      </div>

      {/* Dropzone */}
      <Dropzone
        getUploadParams={getUploadParams}
        onChangeStatus={handleChangeStatus}
        accept="*"
        inputContent="Dosyanızı buraya sürükleyin veya tıklayın"
        styles={{
          dropzone: {
            minHeight: 200,
            border: '2px dashed #0087F7',
            borderRadius: '8px',
          },
        }}
      />

      {/* Dosya Listesi */}
      <h3 style={{ marginTop: "40px" }}>Yüklenen Dosyalar:</h3>
      <ul>
        {fileList.map((file, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            <a href={file.publicUrl} target="_blank" rel="noreferrer">
              {file.name}
            </a>
            <button
              onClick={() => handleDelete(file.name)}
              style={{
                marginLeft: '10px',
                color: 'white',
                backgroundColor: 'red',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
