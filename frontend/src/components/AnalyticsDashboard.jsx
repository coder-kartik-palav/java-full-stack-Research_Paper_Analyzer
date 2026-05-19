import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, Brain, FileText, Layers, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics');
            setAnalytics(res.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full text-indigo-500">Loading analytics...</div>;
    }

    if (!analytics || analytics.totalPapers === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-gray-400">
                <BarChartIcon className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-500">No Analytics Available</h3>
                <p className="mt-2 text-center">Upload some research papers first to generate insights.</p>
            </div>
        );
    }

    // Format data for Recharts
    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    const topicData = Object.keys(analytics.topicDistribution).map((key) => ({
        name: key,
        value: analytics.topicDistribution[key]
    }));

    const trendsData = Object.keys(analytics.uploadTrends).map((key) => ({
        name: key,
        papers: analytics.uploadTrends[key]
    }));

    return (
        <div className="space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-4 bg-indigo-50 rounded-xl text-primary">
                        <FileText className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Papers</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.totalPapers}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-4 bg-green-50 rounded-xl text-green-500">
                        <Layers className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Summaries</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.totalSummaries}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-4 bg-amber-50 rounded-xl text-amber-500">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Top Topic</p>
                        <p className="text-xl font-bold text-gray-900 truncate" title={analytics.topTopic}>{analytics.topTopic}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-4 bg-purple-50 rounded-xl text-purple-500">
                        <Brain className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Avg Complexity</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.averageComplexity}<span className="text-lg text-gray-400">/10</span></p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Topic Distribution Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-96">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Topic Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={topicData}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {topicData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Upload Trends Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-96">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Trends</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="papers" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

        </div>
    );
};

export default AnalyticsDashboard;
