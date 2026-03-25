import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ACCEPTED_TYPES = {
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'text/plain': ['.txt', '.log'],
};

export default function UploadZone({ apiUrl, onUploadSuccess, userId }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': userId || 'anonymous',
        },
      });

      onUploadSuccess(response.data);
    } catch (err) {
      const message = err.response?.data?.error || 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [apiUrl, onUploadSuccess]);

  const onDropRejected = useCallback((rejections) => {
    const rejection = rejections[0];
    if (rejection?.errors?.[0]?.code === 'file-too-large') {
      setError('File too large. Maximum size is 10 MB.');
    } else {
      setError('Unsupported file type. Please upload a CSV, JSON, or TXT file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl relative overflow-hidden transition-all duration-300 border-2 border-dashed ${
          isDragActive
            ? 'border-brand-blue bg-blue-50/50'
            : 'border-brand-blue/30 bg-white hover:border-brand-blue hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="relative p-16 flex flex-col items-center text-center">
          {uploading ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-brand-blue-light flex items-center justify-center mb-6 animate-pulse">
                <svg className="w-8 h-8 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">Uploading & parsing...</p>
              <p className="text-xs text-slate-500 mt-1">This will only take a moment</p>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                isDragActive
                  ? 'bg-brand-blue/20 scale-110'
                  : 'bg-brand-blue-light'
              }`}>
                <svg className={`w-7 h-7 transition-all duration-300 ${
                  isDragActive ? 'text-brand-blue scale-110' : 'text-brand-blue'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drop data files to analyze'}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                CSV, JSON, or Excel. ContextIQ will automatically parse structure and identify intelligence markers.
              </p>

              <div className="mt-8">
                <span className="btn-primary inline-block text-sm shadow-sm hover:shadow-md">
                  Browse Files
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 animate-slide-up flex items-center gap-3">
          <svg className="w-5 h-5 text-accent-rose shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-accent-rose">{error}</p>
        </div>
      )}
    </div>
  );
}
