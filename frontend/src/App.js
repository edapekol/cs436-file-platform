import React from 'react';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';

function App() {
  // upload params - dosyayı nereye göndereceğini tanımlar
  const getUploadParams = () => {
    return { url: 'http://localhost:8080/upload' };
  };

  // upload tamamlandığında çağrılır
  const handleChangeStatus = ({ meta, xhr }, status) => {
    if (status === 'done') {
      console.log(`${meta.name} uploaded successfully`);
      alert(`${meta.name} başarıyla yüklendi ✅`);
    }
    if (status === 'error_upload') {
      alert(`${meta.name} yüklenemedi ❌`);
    }
  };

  return (
    <div style={{ width: '600px', margin: '50px auto' }}>
      <h2>Dosya Yükleme</h2>
      <Dropzone
        getUploadParams={getUploadParams}
        onChangeStatus={handleChangeStatus}
        accept="*"
        inputContent="Dosyanızı buraya sürükleyin veya tıklayın"
        styles={{
          dropzone: { minHeight: 200, border: '2px dashed #0087F7', borderRadius: '8px' },
        }}
      />
    </div>
  );
}

export default App;
