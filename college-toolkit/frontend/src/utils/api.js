// API Helper functions

export const uploadFile = async (file, operation) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('operation', operation);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return await response.json();
};

export const uploadMergeFiles = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const response = await fetch('/api/merge', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Merge files upload failed');
  }

  return await response.json();
};

export const getJobStatus = async (jobId) => {
  const response = await fetch(`/api/status/${jobId}`);
  if (!response.ok) {
    throw new Error('Failed to get job status');
  }
  return await response.json();
};

export const getAnalytics = async () => {
  try {
    const response = await fetch('/api/analytics');
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch analytics', err);
  }
  return {
    totalJobs: 0,
    totalBytesSaved: 0,
    avgCompressionRatio: '1.0',
    jobsByOperation: []
  };
};

export const downloadFile = (jobId) => {
  window.location.href = `/api/download/${jobId}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
