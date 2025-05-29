'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/utils/auth';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface SocialProvider {
  name: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  // Social auth providers
  const socialProviders: SocialProvider[] = [
    {
      name: 'Google',
      icon: '🔍',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => handleSocialAuth('google')
    },
    {
      name: 'Apple',
      icon: '🍎',
      color: 'bg-gray-800 hover:bg-gray-900',
      action: () => handleSocialAuth('apple')
    },
    {
      name: 'GitHub',
      icon: '🐙',
      color: 'bg-gray-700 hover:bg-gray-800',
      action: () => handleSocialAuth('github')
    },
    {
      name: 'Spotify',
      icon: '🎵',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleSocialAuth('spotify')
    }
  ];

  const handleSocialAuth = async (provider: string) => {
    setSocialLoading(provider);
    setError(null);
    
    try {
      // Redirect to OAuth provider
      const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
      window.location.href = authUrl;
    } catch (error: any) {
      setError(`Failed to connect with ${provider}. Please try again.`);
      setSocialLoading(null);
    }
  };

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const errors: ValidationErrors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        if (value.length < 2) {
          errors.name = 'Artist name must be at least 2 characters';
        } else if (value.length > 50) {
          errors.name = 'Artist name must be less than 50 characters';
        } else if (!/^[a-zA-Z0-9\s._-]+$/.test(value)) {
          errors.name = 'Name can only contain letters, numbers, spaces, dots, hyphens, and underscores';
        } else {
          delete errors.name;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete errors.password;
        }
        // Also check confirm password if it has a value
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate on change for better UX
    if (type !== 'checkbox') {
      validateField(name, value);
    }
  };

  const parseErrorMessage = (errorMessage: string): string => {
    // Map backend errors to user-friendly messages
    if (errorMessage.includes('email') && errorMessage.includes('already exists')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (errorMessage.includes('username') && errorMessage.includes('already exists')) {
      return 'This artist name is already taken. Please choose a different name.';
    }
    if (errorMessage.includes('Invalid email format')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('Password must be at least')) {
      return 'Password must be at least 8 characters with uppercase, lowercase, and number.';
    }
    if (errorMessage.includes('Missing required fields')) {
      return 'Please fill in all required fields.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Connection failed. Please check your internet and try again.';
    }
    if (errorMessage.includes('429')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (errorMessage.includes('500')) {
      return 'Server error. Our team has been notified. Please try again in a few minutes.';
    }
    
    // Return original message if no specific mapping
    return errorMessage || 'Registration failed. Please try again.';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    const errors: ValidationErrors = {};
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Artist name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and conditions to create an account.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use name as username (remove spaces and special chars, lowercase)
      const username = formData.name.toLowerCase().replace(/[^a-z0-9._-]/g, '');
      
      console.log('Attempting registration with:', {
        username,
        email: formData.email,
        hasPassword: !!formData.password
      });
      
      await register(username, formData.email, formData.password, 'artist');
      
      // Set success flag for onboarding
      localStorage.setItem('justRegistered', 'true');
      localStorage.setItem('userDisplayName', formData.name);
      
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const friendlyMessage = parseErrorMessage(error.message);
      
      // Check for specific field errors
      if (error.message.includes('email') && error.message.includes('already exists')) {
        setValidationErrors({ email: 'This email is already registered' });
      } else if (error.message.includes('username') && error.message.includes('already exists')) {
        setValidationErrors({ name: 'This artist name is already taken' });
      } else {
        setError(friendlyMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Join Not a Label</h1>
          <p className="mt-2 text-sm text-gray-600">
            Start your independent music journey today
          </p>
        </div>

        <div className="bg-white px-8 py-10 shadow-lg rounded-lg">
          {/* Social Authentication */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 text-center mb-4">Sign up with your existing account</p>
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={provider.action}
                  disabled={socialLoading === provider.name}
                  className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${provider.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {socialLoading === provider.name ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span className="mr-2">{provider.icon}</span>
                      {provider.name}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or create account with email</span>
            </div>
          </div>

          {/* Email Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Artist name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                } focus:border-purple-500 focus:ring-purple-500 focus:outline-none sm:text-sm`}
                placeholder="Your artist or band name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                } focus:border-purple-500 focus:ring-purple-500 focus:outline-none sm:text-sm`}
                placeholder="you@example.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                } focus:border-purple-500 focus:ring-purple-500 focus:outline-none sm:text-sm`}
                placeholder="••••••••"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${
                  validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } focus:border-purple-500 focus:ring-purple-500 focus:outline-none sm:text-sm`}
                placeholder="••••••••"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.agreedToTerms || Object.keys(validationErrors).length > 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}