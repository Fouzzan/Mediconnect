import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WebcamCapture from '../components/WebcamCapture';
import { UserIcon, KeyIcon, MailIcon } from '../components/Icons';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
        setError("Please fill out all account detail fields.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, faceImage);
      navigate('/select-role');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = (image: string) => {
    setFaceImage(image);
    setShowWebcam(false); // Hide webcam after capture to show result
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Create Your Account</h2>
        <p className="text-center text-gray-500 mb-6">Join Mediconnect to manage your health.</p>
        
        {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <form onSubmit={handleRegister} className="space-y-6">
            {/* Account Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="block w-full rounded-md border-gray-300 pl-10 p-2.5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-gray-400" /></div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="block w-full rounded-md border-gray-300 pl-10 p-2.5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><KeyIcon className="h-5 w-5 text-gray-400" /></div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="block w-full rounded-md border-gray-300 pl-10 p-2.5" />
              </div>
            </div>
            
            {/* Optional Face ID Section */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
                 <h3 className="text-lg font-medium text-gray-800 text-center">Face ID (Optional)</h3>
                 <p className="text-sm text-center text-gray-500">Add Face ID for quick and secure passwordless login.</p>

                {showWebcam ? (
                    <WebcamCapture onCapture={handleCapture} />
                ) : faceImage ? (
                    <div className="text-center space-y-2">
                        <img src={faceImage} alt="Face capture" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-500"/>
                        <p className="text-green-700 font-semibold">Face ID Ready</p>
                        <button type="button" onClick={() => { setFaceImage(null); setShowWebcam(true); }} className="text-sm text-teal-600 hover:underline">
                            Retake Photo
                        </button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setShowWebcam(true)} className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-medium text-teal-600 bg-teal-100 hover:bg-teal-200">
                        Add Face ID
                    </button>
                )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300">
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
