import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const PaperUpload = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        setError('');
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/papers/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onUploadSuccess(response.data);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload paper. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Upload Research Paper</h3>
                <p className="text-gray-500 mt-2">Drag and drop your PDF here, and our AI will analyze it instantly.</p>
            </div>

            <div
                className={`mt-4 w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    isDragging ? 'border-primary bg-indigo-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileUpload').click()}
            >
                {file ? (
                    <div className="flex flex-col items-center text-primary">
                        <FileText className="h-16 w-16 mb-4 text-primary" />
                        <span className="font-semibold">{file.name}</span>
                        <span className="text-sm text-gray-500 mt-1">Ready to upload</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <UploadCloud className="h-16 w-16 mb-4 text-indigo-300" />
                        <span className="font-medium text-gray-700 text-lg">Click or drag file to this area</span>
                        <span className="text-sm text-gray-400 mt-2">Support for a single PDF upload.</span>
                    </div>
                )}
                <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleChange}
                />
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Upload & Parse
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaperUpload;
