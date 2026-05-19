import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileUp, Settings, LogOut, Library, BarChart2, Scale, ShieldCheck } from 'lucide-react';
import PaperUpload from '../components/PaperUpload';
import PaperViewer from '../components/PaperViewer';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdminDashboard from '../components/AdminDashboard';
import ComparePapers from '../components/ComparePapers';
import api from '../services/api';

const Dashboard = () => {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const [activeTab, setActiveTab] = useState('upload');
    const [papers, setPapers] = useState([]);
    const [activePaper, setActivePaper] = useState(null);

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const res = await api.get('/papers');
            setPapers(res.data);
            if (res.data.length > 0 && !activePaper) {
                setActivePaper(res.data[0]);
            }
        } catch (error) {
            console.error("Error fetching papers:", error);
        }
    };

    const handleUploadSuccess = (newPaper) => {
        setPapers([newPaper, ...papers]);
        setActivePaper(newPaper);
        setActiveTab('viewer');
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-dark text-white flex flex-col shadow-2xl z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        ResearchAI
                    </h1>
                    <div className="mt-2 text-xs text-gray-400">Intelligent Knowledge Platform</div>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <FileUp className="h-5 w-5" />
                        <span className="font-medium">Upload Paper</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('viewer')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'viewer' ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <Library className="h-5 w-5" />
                        <span className="font-medium">My Library</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <BarChart2 className="h-5 w-5" />
                        <span className="font-medium">Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'compare' ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                        <Scale className="h-5 w-5" />
                        <span className="font-medium">Compare Papers</span>
                    </button>
                    {role === 'ADMIN' && (
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mt-4 border border-red-900 ${activeTab === 'admin' ? 'bg-red-600 text-white shadow-md' : 'text-red-400 hover:bg-gray-800'}`}
                        >
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-medium">Admin Panel</span>
                        </button>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg bg-gray-800">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-bold">
                            {username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{username}</span>
                            <span className="text-xs text-gray-400">{role}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-400 hover:text-white transition-colors border border-red-900"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white h-16 shadow-sm border-b border-gray-200 flex items-center px-8 justify-between z-0">
                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                        {activeTab.replace('-', ' ')}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>Total Papers: {papers.length}</span>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                    {activeTab === 'upload' && (
                        <div className="max-w-4xl mx-auto mt-8">
                            <PaperUpload onUploadSuccess={handleUploadSuccess} />
                        </div>
                    )}

                    {activeTab === 'viewer' && (
                        <div className="flex gap-6 h-full">
                            <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 overflow-y-auto">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Library</h3>
                                <div className="space-y-2">
                                    {papers.map((p) => (
                                        <div 
                                            key={p.id}
                                            onClick={() => setActivePaper(p)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${activePaper?.id === p.id ? 'bg-indigo-50 border-primary shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
                                        >
                                            <h4 className={`font-semibold line-clamp-2 ${activePaper?.id === p.id ? 'text-primary' : 'text-gray-800'}`}>{p.title}</h4>
                                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>{p.publicationYear}</span>
                                                <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">{p.complexityScore}/10</span>
                                            </div>
                                        </div>
                                    ))}
                                    {papers.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center mt-8">No papers uploaded yet.</p>
                                    )}
                                </div>
                            </div>
                            <div className="w-2/3 h-[calc(100vh-8rem)]">
                                <PaperViewer paper={activePaper} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="h-full">
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {activeTab === 'compare' && (
                        <div className="h-full max-w-4xl mx-auto">
                            <ComparePapers papers={papers} />
                        </div>
                    )}

                    {activeTab === 'admin' && role === 'ADMIN' && (
                        <div className="h-full">
                            <AdminDashboard />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
