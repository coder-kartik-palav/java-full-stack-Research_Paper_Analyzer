import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../services/api';

const Flashcards = ({ paperId }) => {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const fetchFlashcards = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/papers/${paperId}/flashcards`);
                setFlashcards(res.data);
            } catch (error) {
                console.error("Error fetching flashcards", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFlashcards();
    }, [paperId]);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-indigo-500">
                <RefreshCw className="h-10 w-10 animate-spin mb-4" />
                <p>Generating flashcards with AI...</p>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return <div className="text-center text-gray-500 mt-10">No flashcards available for this paper.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto py-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Study Flashcards</h3>
            <p className="text-gray-500 mb-8">Test your knowledge on key concepts</p>

            <div 
                className="relative w-full h-80 perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`w-full h-full transition-transform duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full bg-white border-2 border-indigo-100 rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center backface-hidden text-center">
                        <span className="absolute top-4 left-4 text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded">Q</span>
                        <h2 className="text-2xl font-medium text-gray-800 leading-snug">{flashcards[currentIndex].front}</h2>
                        <span className="absolute bottom-4 text-sm text-gray-400">Click to flip</span>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full bg-indigo-600 border-2 border-indigo-700 rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center backface-hidden rotate-y-180 text-center text-white">
                        <span className="absolute top-4 left-4 text-xs font-bold text-white bg-indigo-500 px-2 py-1 rounded">A</span>
                        <p className="text-xl font-medium leading-relaxed">{flashcards[currentIndex].back}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-6 mt-8">
                <button 
                    onClick={handlePrev}
                    className="p-3 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="font-medium text-gray-600">
                    {currentIndex + 1} / {flashcards.length}
                </span>
                <button 
                    onClick={handleNext}
                    className="p-3 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>
            
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default Flashcards;
