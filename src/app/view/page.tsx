'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

function ViewerContent() {
  const searchParams = useSearchParams();
  
  const url = searchParams.get('url');
  const name = searchParams.get('name');

  if (!url) {
    return (
      <div className={styles.emptyState} style={{ margin: '4rem auto', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Invalid View Parameters</h2>
        <p>No file URL was provided for preview.</p>
        <Link href="/" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '1rem', textDecoration: 'none' }}>
          Back to Workbench
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.viewLayout}>
      <header className={styles.viewHeader}>
        <div className={styles.viewHeaderLeft}>
          <Link href="/" className={`${styles.btn} ${styles.btnIconOnly}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Back to main page">
            {/* Arrow Left Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Workbench</span>
          </Link>
          <div className={styles.viewTitleSection}>
            <span className={styles.htmlIcon} style={{ fontSize: '0.65rem', width: '28px', height: '28px' }}>HTML</span>
            <h1 className={styles.viewFileName}>{name || 'Unnamed Template'}</h1>
          </div>
        </div>
        
        <div className={styles.viewHeaderRight}>
          <a href={url} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnPrimary}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* External Link Icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Open in New Tab
          </a>
        </div>
      </header>
      
      <div className={styles.viewFrameContainer}>
        <iframe 
          src={url} 
          className={styles.viewFrame}
          title={`Preview of ${name}`}
        />
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className={styles.emptyState} style={{ margin: '4rem auto', maxWidth: '600px' }}>
        <p>Loading HTML Viewer...</p>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
