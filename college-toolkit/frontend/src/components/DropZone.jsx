import React, { useState, useRef } from 'react';
import { uploadFile, uploadMergeFiles, formatFileSize } from '../utils/api';

const DropZone = ({ selectedTool, onJobStarted }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const isMerge = selectedTool.operation === 'merge';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const invalidFiles = [];
    const validFiles = [];

    for (const file of files) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      let isAllowed = false;

      if (selectedTool.id === 'compress') {
        isAllowed = ext === '.pdf';
      } else if (selectedTool.id === 'convert') {
        isAllowed = ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'].includes(ext);
      } else if (selectedTool.id === 'merge') {
        isAllowed = ext === '.pdf';
      } else if (selectedTool.id === 'img2pdf') {
        isAllowed = ['.jpg', '.jpeg', '.png'].includes(ext);
      }

      if (isAllowed) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`Invalid file format for this tool. Expected formats: ${selectedTool.types.join(', ')}.`);
      return;
    }

    if (validFiles.length === 0) return;

    if (isMerge) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles([validFiles[0]]);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const onUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      let data;
      if (isMerge) {
        data = await uploadMergeFiles(selectedFiles);
      } else {
        data = await uploadFile(selectedFiles[0], selectedTool.operation);
      }
      onJobStarted(data.jobId);
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dropzone-container glass animate-fade-in">
      <div className="dropzone-header">
        <h3>{selectedTool.title}</h3>
        <p>Accepted formats: {selectedTool.types.join(', ')}</p>
      </div>

      <div
        className={`dropzone-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <div className="dropzone-icon">📁</div>
        <p>Drag and drop your file{isMerge ? 's' : ''} here, or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          multiple={isMerge}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-list">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
              <button className="remove-btn" onClick={() => removeFile(idx)}>✖</button>
            </div>
          ))}
          <button 
            className="btn btn-primary btn-block upload-btn" 
            onClick={onUpload}
            disabled={uploading || (isMerge && selectedFiles.length < 2)}
          >
            {uploading ? 'Processing...' : 'Upload & Process'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DropZone;
