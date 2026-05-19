import React, { useState } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import api from '../services/api';

const ComparePapers = ({ papers }) => {
    const [paper1Id, setPaper1Id] = useState('');
    const [paper2Id, setPaper2Id] = useState('');
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCompare = async () => {
        if (!paper1Id || !paper2Id || paper1Id === paper2Id) return;
        setLoading(true);

        const p1 = papers.find(p => p.id === parseInt(paper1Id));
        const p2 = papers.find(p => p.id === parseInt(paper2Id));

        try {
            const res = await api.post('/papers/compare', {
                paper1_title: p1.title,
                paper2_title: p2.title
            });
            setComparison(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (papers.length < 2) {
        return <div className="text-center text-gray-500 mt-10 p-8 bg-white rounded-2xl border border-dashed border-gray-300">You need to upload at least 2 papers to use the comparison feature.</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
                <Scale className="h-8 w-8 text-indigo-500" />
                <h2 className="text-2xl font-bold text-gray-800">Compare Research Papers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select First Paper</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                        value={paper1Id}
                        onChange={(e) => setPaper1Id(e.target.value)}
                    >
                        <option value="">-- Choose Paper --</option>
                        {papers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Second Paper</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                        value={paper2Id}
                        onChange={(e) => setPaper2Id(e.target.value)}
                    >
                        <option value="">-- Choose Paper --</option>
                        {papers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>
            </div>

            <button
                onClick={handleCompare}
                disabled={!paper1Id || !paper2Id || paper1Id === paper2Id || loading}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
                {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing...</> : 'Compare Using AI'}
            </button>

            {comparison && (
                <div className="mt-10 space-y-6">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
                        <span className="text-lg font-semibold text-indigo-900">AI Similarity Score</span>
                        <div className="flex items-center justify-center h-16 w-16 bg-white rounded-full shadow text-2xl font-bold text-indigo-600">
                            {comparison.similarityScore}%
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-3">Methodology Differences</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{comparison.methodologyDifferences}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-3">Results Comparison</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{comparison.resultsComparison}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white">
                        <h3 className="font-semibold text-indigo-100 mb-2">Final Conclusion</h3>
                        <p className="leading-relaxed">{comparison.conclusion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparePapers;
