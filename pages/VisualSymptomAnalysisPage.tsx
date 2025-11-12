
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UploadCloudIcon, XIcon, BrainCircuitIcon, SparklesIcon } from '../components/Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as base64 string.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};

const VisualSymptomAnalysisPage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile || !description.trim()) {
            setError('Please upload an image and provide a description.');
            return;
        }

        setError('');
        setIsLoading(true);
        setAnalysisResult('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(imageFile);

            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Data,
                },
            };

            const prompt = `You are an AI medical assistant. Analyze the user's provided image and text description of their symptom.
1.  **Describe the image:** Briefly describe what you see in the image in objective terms (e.g., "The image shows a red, bumpy rash on an arm.").
2.  **List possibilities:** Based on the visual information and the user's description, list a few *potential* (non-diagnostic) conditions or causes that might be associated with these symptoms. Use general terms.
3.  **Recommend a specialist:** Suggest the type of medical specialist who would be most appropriate to consult for these symptoms (e.g., "Dermatologist," "General Practitioner," "Allergist").
4.  **Crucial Disclaimer:** End your response with the following mandatory disclaimer: "Disclaimer: I am an AI assistant and this is not a medical diagnosis. This analysis is for informational purposes only. Please consult a qualified healthcare professional for an accurate diagnosis and treatment plan."

User's description: ${description}`;

            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });

            setAnalysisResult(response.text);

        } catch (err) {
            console.error('Gemini API error:', err);
            setError('Failed to get analysis. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setDescription('');
        setAnalysisResult('');
        setError('');
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Visual Symptom Analysis</h1>
            <p className="text-lg text-gray-600 mb-8">Upload a photo of a symptom for an AI-powered analysis.</p>

            {analysisResult ? (
                <ResultView result={analysisResult} imagePreview={imagePreview!} description={description} onReset={handleReset} />
            ) : (
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Image Uploader */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-2">Step 1: Upload an Image</label>
                            <div
                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-teal-500"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img src={imagePreview} alt="Symptom preview" className="mx-auto h-48 w-auto rounded-md object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-semibold">Click to change image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-teal-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-2">Step 2: Describe the Symptom</label>
                            <textarea
                                id="description"
                                rows={8}
                                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                                placeholder="For example: 'This rash appeared on my arm 3 days ago. It's itchy and has small red bumps.'"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Disclaimer and Button */}
                    <div className="mt-8 border-t pt-6">
                         <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
                            <p className="font-bold">Important Disclaimer</p>
                            <p>This is not a medical diagnosis. This tool provides information for educational purposes only. Always consult a qualified healthcare professional for medical advice.</p>
                        </div>

                        {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                        
                        <div className="text-center mt-6">
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !imageFile || !description}
                                className="inline-flex items-center gap-3 justify-center w-full max-w-xs bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-teal-700 transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <BrainCircuitIcon className="w-6 h-6" />
                                        Analyze Symptom
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Component to display the analysis result
const ResultView: React.FC<{ result: string; imagePreview: string; description: string; onReset: () => void; }> = ({ result, imagePreview, description, onReset }) => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 animate-in fade-in-0 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User's Submission */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Submission</h2>
                    <img src={imagePreview} alt="Symptom" className="w-full rounded-lg mb-4 max-h-64 object-contain" />
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <p className="font-semibold text-gray-700">Your Description:</p>
                        <p className="text-gray-600 italic">"{description}"</p>
                    </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-gradient-to-br from-slate-800 to-gray-900 text-white p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-teal-400"/> AI Analysis</h2>
                    <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">{result}</div>
                </div>
             </div>

             <div className="text-center mt-8 border-t pt-6">
                <button
                    onClick={onReset}
                    className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Start a New Analysis
                </button>
             </div>
        </div>
    );
};


export default VisualSymptomAnalysisPage;
