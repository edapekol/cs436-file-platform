import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';

function App() {
  const [fileList, setFileList] = useState([]);
  const [sortOption, setSortOption] = useState({ sort: "name", order: "asc" });

  // Fetch file list from backend
  const fetchFileList = () => {
    const query = `?sort=${sortOption.sort}&order=${sortOption.order}`;

    fetch(`http://localhost:8080/files${query}`)
      .then(res => res.json())
      .then(data => setFileList(data))
      .catch(err => console.error("Failed to fetch files:", err));
  };

  // Update list when sort option changes
  useEffect(() => {
    fetchFileList();
  }, [sortOption]);

  // Handle file deletion
  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${filename}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/files/${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(`${filename} deleted successfully ✅`);
        fetchFileList();
      } else {
        alert(`Failed to delete ${filename} ❌`);
      }
    } catch (err) {
      console.error("Deletion error:", err);
      alert("An error occurred while deleting the file.");
    }
  };

  // Update file list after upload
  const getUploadParams = () => {
    return { url: 'http://localhost:8080/upload' };
  };

  const handleChangeStatus = ({ meta }, status) => {
    if (status === 'done') {
      console.log(`${meta.name} uploaded successfully`);
      alert(`${meta.name} uploaded successfully ✅`);
      fetchFileList();
    }
    if (status === 'error_upload') {
      alert(`${meta.name} failed to upload ❌`);
    }
  };

  return (
    <div style={{ width: '600px', margin: '50px auto' }}>
      <h2>File Upload</h2>

      {/* Sorting Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={`${sortOption.sort}-${sortOption.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split("-");
            setSortOption({ sort, order });
          }}
          style={{ marginLeft: '10px', padding: '4px' }}
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="date-desc">Uploaded: Newest → Oldest</option>
          <option value="date-asc">Uploaded: Oldest → Newest</option>
          <option value="size-asc">Size: Small → Large</option>
          <option value="size-desc">Size: Large → Small</option>
        </select>
      </div>

      {/* Dropzone */}
      <Dropzone
        getUploadParams={getUploadParams}
        onChangeStatus={handleChangeStatus}
        accept="*"
        inputContent="Drag your file here or click to upload"
        styles={{
          dropzone: {
            minHeight: 200,
            border: '2px dashed #0087F7',
            borderRadius: '8px',
          },
        }}
      />

      {/* File List */}
      <h3 style={{ marginTop: "40px" }}>Uploaded Files:</h3>
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
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;


