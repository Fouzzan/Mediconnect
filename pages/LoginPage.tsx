import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WebcamCapture from '../components/WebcamCapture';
import { UserIcon, KeyIcon } from '../components/Icons';

type LoginMode = 'password' | 'faceid';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithPassword, loginWithFaceId, user } = useAuth();
  
  const handleSuccess = (loggedInUser: any) => {
    if (loggedInUser.role === 'patient') {
      navigate('/dashboard');
    } else if (loggedInUser.role === 'clinician') {
      navigate('/clinician/dashboard');
    } else if (loggedInUser.role === 'admin') {
      navigate('/admin/dashboard');
    }
    else {
      navigate('/select-role');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginWithPassword(username, password);
      // We can't get the user object directly here, so we'll rely on the redirect logic in App.tsx
      // For a slightly better UX, we'll just navigate to a common place and let App.tsx handle it.
       navigate('/');

    } catch (err: any) {
      setError(err.message || 'Failed to log in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImage) {
      setError('Please capture your photo to log in.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await loginWithFaceId(username, faceImage);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Face ID login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordForm = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5" />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <KeyIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5" />
        </div>
      </div>
      <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300">
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );

  const renderFaceIdForm = () => (
    <form onSubmit={handleFaceIdSubmit} className="space-y-6">
        <div>
            <label htmlFor="face-username" className="block text-sm font-medium text-gray-700">Username</label>
            <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" id="face-username" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter your username first" className="block w-full rounded-md border-gray-300 pl-10 focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5" />
            </div>
        </div>
      <WebcamCapture onCapture={setFaceImage} onClear={() => setFaceImage(null)} />
      <button type="submit" disabled={isLoading || !faceImage || !username} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300">
        {isLoading ? 'Verifying...' : 'Sign In with Face ID'}
      </button>
    </form>
  );

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Sign in to continue to Mediconnect.</p>
        
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setMode('password')} className={`flex-1 py-2 text-sm font-medium ${mode === 'password' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500'}`}>Password</button>
          <button onClick={() => setMode('faceid')} className={`flex-1 py-2 text-sm font-medium ${mode === 'faceid' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500'}`}>Face ID</button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {mode === 'password' ? renderPasswordForm() : renderFaceIdForm()}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
