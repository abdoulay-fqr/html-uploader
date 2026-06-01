'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface HtmlFile {
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export default function Home() {
  const [files, setFiles] = useState<HtmlFile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload States
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');



  // Delete States
  const [deleteFile, setDeleteFile] = useState<HtmlFile | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Format File Size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format Date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFileUpload(file);
    }
  };

  // Process File Upload using XMLHttpRequest for real progress tracking
  const processFileUpload = (file: File) => {
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.html') && !lowerName.endsWith('.htm')) {
      setUploadError('Only HTML files (.html, .htm) are allowed.');
      setUploadSuccess(null);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadingFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    // Monitor upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    });

    // Handle upload completion
    xhr.addEventListener('load', () => {
      setUploading(false);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          setUploadSuccess(`"${file.name}" uploaded successfully!`);
          fetchFiles();
          // Reset file input value
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setUploadError(response.error || 'Failed to upload file.');
        }
      } catch (err) {
        setUploadError('Failed to upload file due to server response error.');
      }
    });

    // Handle upload error
    xhr.addEventListener('error', () => {
      setUploading(false);
      setUploadError('A network error occurred during upload.');
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  // Process File Delete
  const processFileDelete = async () => {
    if (!deleteFile) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: deleteFile.url,
          password: deletePassword,
        }),
      });

      const response = await res.json();
      
      if (res.ok && response.success) {
        setFiles(files.filter(f => f.url !== deleteFile.url));
        setDeleteFile(null);
        setDeletePassword('');
      } else {
        setDeleteError(response.error || 'Incorrect deletion password.');
      }
    } catch (err) {
      setDeleteError('An error occurred during file deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className={styles.container}>
      {/* Header section */}
      <header className={styles.header}>
        <div className={styles.badge}>HTML Preview Center</div>
        <h1 className={styles.title}>HTML Interactive Workbench</h1>
        <p className={styles.description}>
          Upload your static HTML mockups or web templates instantly, preview them in high-fidelity inline overlays, and share them with other visitors.
        </p>
      </header>

      {/* Main split grid */}
      <div className={styles.mainGrid}>
        
        {/* Left column: Upload Card */}
        <section className={styles.uploadCard}>
          <h2 className={styles.uploadCardTitle}>Publish New HTML</h2>
          
          <div 
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            id="dropzone-area"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className={styles.fileInput} 
              onChange={handleFileSelect}
              accept=".html,.htm"
              id="file-input-selector"
            />
            
            {/* SVG Upload Cloud Icon */}
            <svg 
              className={styles.uploadIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            
            <div>
              <p className={styles.uploadText}>Drag & drop HTML file here</p>
              <p className={styles.uploadSubtext}>or click to browse your storage</p>
            </div>
          </div>

          {/* Upload progress & messages */}
          {uploading && (
            <div className={styles.uploadStatus}>
              <div className={styles.uploadStatusHeader}>
                <span className={styles.uploadFileName}>{uploadingFileName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className={`${styles.message} ${styles.messageSuccess}`}>
              {uploadSuccess}
            </div>
          )}

          {uploadError && (
            <div className={`${styles.message} ${styles.messageError}`}>
              {uploadError}
            </div>
          )}
        </section>

        {/* Right column: Files listing */}
        <section className={styles.listPanel}>
          <div className={styles.listPanelHeader}>
            <h2 className={styles.sectionTitle}>
              Uploaded Templates
              <span className={styles.fileCount}>{files.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <p>Scanning repository files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className={styles.emptyState}>
              {/* SVG Empty Folder Icon */}
              <svg 
                className={styles.emptyIcon} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p>No HTML files found. Publish a file to see it listed here!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {files.map((file) => (
                <div key={file.name} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.htmlIcon}>HTML</div>
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName} title={file.name}>
                        {file.name}
                      </span>
                      <span className={styles.fileSize}>{formatSize(file.size)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.fileDate}>{formatDate(file.uploadedAt)}</span>
                    <div className={styles.actions}>
                      <Link 
                        href={`/view?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`}
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        title="Open preview page"
                        id={`open-btn-${file.name}`}
                        style={{ textDecoration: 'none' }}
                      >
                        {/* Eye Icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Open
                      </Link>
                      <button 
                        onClick={() => {
                          setDeleteFile(file);
                          setDeletePassword('');
                          setDeleteError(null);
                        }} 
                        className={`${styles.btn} ${styles.btnDanger}`}
                        title="Delete file"
                        id={`delete-btn-${file.name}`}
                      >
                        {/* Trash Icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>



      {/* Delete Confirmation Modal */}
      {deleteFile && (
        <div className={styles.overlay} onClick={() => setDeleteFile(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalDescription}>
              You are about to delete <strong>{deleteFile.name}</strong>. Enter the system password to confirm.
            </p>
            
            <input 
              type="password" 
              placeholder="Enter deletion password" 
              className={styles.modalInput}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') processFileDelete();
              }}
              autoFocus
              id="delete-password-input"
            />

            {deleteError && (
              <div className={`${styles.message} ${styles.messageError}`} style={{ padding: '0.4rem 0.6rem' }}>
                {deleteError}
              </div>
            )}

            <div className={styles.modalActions}>
              <button 
                onClick={() => setDeleteFile(null)} 
                className={`${styles.btn} ${styles.btnIconOnly}`}
                style={{ padding: '0.6rem 1rem' }}
                id="cancel-delete-modal"
              >
                Cancel
              </button>
              <button 
                onClick={processFileDelete} 
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ background: 'var(--danger)' }}
                disabled={isDeleting}
                id="confirm-delete-modal"
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>HTML Workbench App • Deletion Password: <strong style={{ color: 'var(--primary)' }}>delete-secure-2026</strong></p>
      </footer>
    </main>
  );
}
