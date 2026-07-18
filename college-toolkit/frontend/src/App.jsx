import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ToolCard from './components/ToolCard';
import DropZone from './components/DropZone';
import JobStatus from './components/JobStatus';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Footer from './components/Footer';
import { getJobStatus } from './utils/api';

const tools = [
  { id: 'compress', title: 'Compress PDF', operation: 'compress', icon: '📄', description: 'Reduce PDF file size for portal uploads', types: ['PDF'] },
  { id: 'convert', title: 'Doc to PDF', operation: 'convert', icon: '🔄', description: 'Convert Word/PPT to PDF format', types: ['DOCX', 'PPTX'] },
  { id: 'merge', title: 'Merge PDFs', operation: 'merge', icon: '📑', description: 'Combine multiple PDFs into one', types: ['PDF (multiple)'] },
  { id: 'img2pdf', title: 'Image to PDF', operation: 'img2pdf', icon: '🖼️', description: 'Convert assignment photos to PDF', types: ['JPG', 'PNG'] },
];

function App() {
  const [selectedToolId, setSelectedToolId] = useState(tools[0].id);
  const [jobs, setJobs] = useState([]);

  const selectedTool = tools.find(t => t.id === selectedToolId);

  const handleJobStarted = (jobId) => {
    setJobs(prev => [{ id: jobId, status: 'processing', operation: selectedTool.operation }, ...prev]);
  };

  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status === 'processing');
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const status = await getJobStatus(job.id);
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...status } : j));
        } catch (e) {
          console.error(e);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  return (
    <div className="app-wrapper">
      <Navbar />
      <Hero />
      
      <main className="main-content" id="tools">
        <div className="container">
          <div className="tools-grid">
            {tools.map(tool => (
              <ToolCard
                key={tool.id}
                {...tool}
                active={selectedToolId === tool.id}
                onClick={() => setSelectedToolId(tool.id)}
              />
            ))}
          </div>

          <div className="workspace">
            <DropZone selectedTool={selectedTool} onJobStarted={handleJobStarted} />
            <JobStatus jobs={jobs} />
          </div>
        </div>
      </main>

      <AnalyticsDashboard />
      <Footer />
    </div>
  );
}

export default App;
