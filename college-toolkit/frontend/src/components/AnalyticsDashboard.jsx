import React, { useEffect, useState } from 'react';
import { getAnalytics, formatFileSize } from '../utils/api';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAnalytics().then(data => setStats(data));
  }, []);

  if (!stats) return null;

  // Convert jobsByOperation from object { compress: 1 } to array [{ operation: 'compress', count: 1 }]
  let operationsArray = [];
  if (stats.jobsByOperation) {
    if (Array.isArray(stats.jobsByOperation)) {
      operationsArray = stats.jobsByOperation;
    } else if (typeof stats.jobsByOperation === 'object') {
      operationsArray = Object.entries(stats.jobsByOperation).map(([operation, count]) => ({
        operation,
        count: Number(count)
      }));
    }
  }

  const maxOp = operationsArray.length > 0 ? Math.max(...operationsArray.map(op => op.count)) : 1;

  return (
    <section className="analytics-section" id="analytics">
      <div className="container">
        <h2 className="section-title">Platform <span className="gradient-text">Analytics</span></h2>
        
        <div className="stats-grid">
          <div className="stat-card glass">
            <div className="stat-card-title">Total Files</div>
            <div className="stat-card-value">{stats.totalJobs}</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-card-title">Storage Saved</div>
            <div className="stat-card-value">{formatFileSize(stats.totalBytesSaved)}</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-card-title">Avg Compression</div>
            <div className="stat-card-value">{(parseFloat(stats.avgCompressionRatio)*100).toFixed(0)}%</div>
          </div>
        </div>

        {operationsArray.length > 0 && (
          <div className="chart-card glass">
            <h3 className="chart-title">Jobs by Operation</h3>
            <div className="bar-chart">
              {operationsArray.map((op, idx) => (
                <div key={idx} className="bar-row">
                  <div className="bar-label">{op.operation}</div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill gradient-bg" 
                      style={{ width: `${(op.count / maxOp) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{op.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
