import React, { useState, useEffect } from 'react';
import { Users, FileText, Activity, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                setError('Failed to load admin stats. Make sure you are logged in as Admin.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-indigo-500">Loading admin panel...</div>;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 text-gray-800 mb-8">
                <ShieldCheck className="h-8 w-8 text-red-500" />
                <h2 className="text-2xl font-bold">Admin Analytics Panel</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <Users className="h-10 w-10 text-indigo-500 mb-2" />
                    <p className="text-gray-500 font-medium">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                    <div className="flex space-x-4 mt-4 text-sm text-gray-600">
                        <span>Students: {stats.totalStudents}</span>
                        <span>Researchers: {stats.totalResearchers}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <FileText className="h-10 w-10 text-blue-500 mb-2" />
                    <p className="text-gray-500 font-medium">Total Papers Uploaded</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalPapers}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <Activity className="h-10 w-10 text-green-500 mb-2" />
                    <p className="text-gray-500 font-medium">System Health</p>
                    <p className="text-2xl font-bold text-green-600 mt-4">{stats.systemHealth}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <ShieldCheck className="h-10 w-10 text-purple-500 mb-2" />
                    <p className="text-gray-500 font-medium">AI Confidence Avg</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.aiConfidenceAvg}%</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
