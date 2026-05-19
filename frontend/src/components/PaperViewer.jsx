import React, { useState } from 'react';
import { BookOpen, BrainCircuit, BarChart, Layers, MessageSquare, GraduationCap } from 'lucide-react';
import ChatPanel from './ChatPanel';
import Flashcards from './Flashcards';

const PaperViewer = ({ paper }) => {
    const [activeTab, setActiveTab] = useState('analysis');

    if (!paper) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-gray-400">
                <BookOpen className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-500">No Paper Selected</h3>
                <p className="mt-2 text-center">Upload a paper from the dashboard or select one from your library to view its AI summary.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="bg-indigo-900 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight line-clamp-2">{paper.title}</h2>
                        <p className="mt-1 text-indigo-200 text-sm">Authors: {paper.authors} ({paper.publicationYear})</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-4">
                        <span className="bg-indigo-800 text-indigo-100 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                            {paper.readingDifficulty}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-indigo-200">
                            <BrainCircuit className="h-4 w-4" />
                            <span>Complexity: {paper.complexityScore}/10</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mt-6 space-x-2 bg-indigo-950 p-1 rounded-lg w-max">
                    <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-300 hover:text-white hover:bg-indigo-800'}`}
                    >
                        <BarChart className="h-4 w-4 mr-2" /> Analysis
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-300 hover:text-white hover:bg-indigo-800'}`}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" /> Chat with AI
                    </button>
                    <button 
                        onClick={() => setActiveTab('flashcards')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'flashcards' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-300 hover:text-white hover:bg-indigo-800'}`}
                    >
                        <GraduationCap className="h-4 w-4 mr-2" /> Flashcards
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {activeTab === 'analysis' && (
                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center space-x-2 text-primary mb-3">
                                <BarChart className="h-5 w-5" />
                                <h3 className="text-lg font-semibold">Short Summary</h3>
                            </div>
                            <div className="bg-white border border-indigo-100 p-5 rounded-xl text-indigo-900 text-base shadow-sm">
                                {paper.shortSummary}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center space-x-2 text-gray-800 mb-3">
                                <Layers className="h-5 w-5 text-gray-500" />
                                <h3 className="text-lg font-semibold">Key Topics</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {paper.topics.split(',').map((topic, index) => (
                                    <span key={index} className="px-3 py-1 bg-white shadow-sm text-gray-700 rounded-lg text-sm border border-gray-200">
                                        {topic.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed AI Analysis</h3>
                            <div className="prose prose-indigo max-w-none text-gray-600 text-sm leading-relaxed bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <p>{paper.detailedSummary}</p>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <ChatPanel paperId={paper.id} />
                )}

                {activeTab === 'flashcards' && (
                    <Flashcards paperId={paper.id} />
                )}
            </div>
        </div>
    );
};

export default PaperViewer;
