import React from 'react';
import { formatFileSize, downloadFile } from '../utils/api';

const JobStatus = ({ jobs }) => {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="jobs-container">
      <h3>Active Jobs</h3>
      <div className="jobs-list">
        {jobs.map(job => (
          <div key={job.id} className="job-card glass animate-slide-up">
            <div className="job-info">
              <div className="job-header">
                <span className="job-filename">{job.original_filename || job.output_filename}</span>
                <span className={`status-badge status-${job.status}`}>{job.status}</span>
              </div>
              <div className="job-details">
                <span className="badge op-badge">{job.operation}</span>
                {job.status === 'completed' && job.original_size && (
                  <span className="job-sizes">
                    {formatFileSize(job.original_size)} ➔ {formatFileSize(job.processed_size)} 
                    <span className="savings"> ({((1 - job.processed_size/job.original_size)*100).toFixed(1)}% saved)</span>
                  </span>
                )}
              </div>
            </div>
            <div className="job-actions">
              {job.status === 'processing' && (
                <div className="progress-bar">
                  <div className="progress-fill shimmer"></div>
                </div>
              )}
              {job.status === 'completed' && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadFile(job.id)}
                >
                  Download
                </button>
              )}
              {job.status === 'failed' && (
                <span className="error-text">Failed to process</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobStatus;
