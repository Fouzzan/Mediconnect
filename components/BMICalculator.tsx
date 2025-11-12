import React, { useState, useMemo } from 'react';

const BMICalculator: React.FC = () => {
    const [height, setHeight] = useState(''); // in cm
    const [weight, setWeight] = useState(''); // in kg
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => setHeight(e.target.value);
    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value);
    
    const bmiResult = useMemo(() => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (!h || !w || h <= 0 || w <= 0) {
            return null;
        }

        let bmi;
        if (unitSystem === 'metric') {
            // weight (kg) / [height (m)]^2
            bmi = w / ((h / 100) ** 2);
        } else {
            // 703 * weight (lbs) / [height (in)]^2
            bmi = 703 * (w / (h ** 2));
        }

        const bmiValue = parseFloat(bmi.toFixed(1));
        let category = '';
        let colorClass = '';

        if (bmiValue < 18.5) {
            category = 'Underweight';
            colorClass = 'text-blue-600';
        } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
            category = 'Normal weight';
            colorClass = 'text-green-600';
        } else if (bmiValue >= 25 && bmiValue <= 29.9) {
            category = 'Overweight';
            colorClass = 'text-yellow-600';
        } else {
            category = 'Obese';
            colorClass = 'text-red-600';
        }
        
        return { value: bmiValue, category, colorClass };
    }, [height, weight, unitSystem]);
    
    const heightLabel = unitSystem === 'metric' ? 'Height (cm)' : 'Height (in)';
    const weightLabel = unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
    const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5";


    return (
        <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">BMI Calculator</h3>
            <div className="flex justify-end mb-4">
                <div className="flex p-1 bg-gray-200 rounded-md">
                    <button onClick={() => setUnitSystem('metric')} className={`px-3 py-1 text-sm rounded ${unitSystem === 'metric' ? 'bg-white shadow' : ''}`}>Metric</button>
                    <button onClick={() => setUnitSystem('imperial')} className={`px-3 py-1 text-sm rounded ${unitSystem === 'imperial' ? 'bg-white shadow' : ''}`}>Imperial</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">{heightLabel}</label>
                    <input type="number" id="height" value={height} onChange={handleHeightChange} className={`mt-1 ${inputClasses}`} />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">{weightLabel}</label>
                    <input type="number" id="weight" value={weight} onChange={handleWeightChange} className={`mt-1 ${inputClasses}`} />
                </div>
            </div>
            {bmiResult && (
                <div className="mt-6 text-center bg-slate-50 p-4 rounded-lg">
                    <p className="text-lg text-gray-600">Your BMI is</p>
                    <p className={`text-5xl font-bold ${bmiResult.colorClass}`}>{bmiResult.value}</p>
                    <p className={`text-lg font-semibold ${bmiResult.colorClass}`}>{bmiResult.category}</p>
                </div>
            )}
        </div>
    );
};

export default BMICalculator;