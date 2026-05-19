import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, FlaskConical, ShieldAlert, LogIn } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { username, password, role });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-500">Log in to your Research Intelligence account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Role to Login As</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('STUDENT')}
                                className={`flex flex-col items-center p-3 rounded-xl border ${role === 'STUDENT' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <BookOpen className="h-6 w-6 mb-1" />
                                <span className="text-xs font-semibold">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('RESEARCHER')}
                                className={`flex flex-col items-center p-3 rounded-xl border ${role === 'RESEARCHER' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FlaskConical className="h-6 w-6 mb-1" />
                                <span className="text-xs font-semibold">Researcher</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ADMIN')}
                                className={`flex flex-col items-center p-3 rounded-xl border ${role === 'ADMIN' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <ShieldAlert className="h-6 w-6 mb-1" />
                                <span className="text-xs font-semibold">Admin</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in as {role}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary hover:text-indigo-600">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
