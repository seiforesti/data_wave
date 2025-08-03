'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { 
  GoogleIcon, 
  MicrosoftIcon, 
  LoadingSpinner, 
  DataGovernanceIcon 
} from '../shared/Icons';
import { authService } from '../../services/auth.service';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES, FIELD_LENGTHS } from '../../constants/validation.constants';
import { THEME_COLORS, ANIMATIONS, FORM_CONFIG } from '../../constants/ui.constants';
import type { 
  LoginRequest, 
  SignupRequest, 
  VerifyCodeRequest, 
  AuthResponse 
} from '../../types/auth.types';

// Enhanced interfaces for form state management
interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department: string;
  region: string;
  verificationCode: string;
  profilePicture: File | null;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  region?: string;
  verificationCode?: string;
  profilePicture?: string;
  general?: string;
}

interface ValidationState {
  isValid: boolean;
  errors: FormErrors;
  touched: Record<keyof FormState, boolean>;
}

type AuthStep = 'login' | 'signup' | 'verify' | 'success';
type AuthMethod = 'email' | 'google' | 'microsoft';

// Advanced form validation hook
const useFormValidation = (initialState: FormState) => {
  const [state, setState] = useState<FormState>(initialState);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    errors: {},
    touched: {} as Record<keyof FormState, boolean>
  });

  const validateField = useCallback((field: keyof FormState, value: string | File | null): string | undefined => {
    switch (field) {
      case 'email':
        if (!value) return VALIDATION_MESSAGES.REQUIRED;
        if (typeof value === 'string' && !VALIDATION_PATTERNS.EMAIL.test(value)) {
          return VALIDATION_MESSAGES.INVALID_EMAIL;
        }
        if (typeof value === 'string' && value.length > FIELD_LENGTHS.EMAIL.max) {
          return VALIDATION_MESSAGES.TOO_LONG(FIELD_LENGTHS.EMAIL.max);
        }
        break;
      
      case 'firstName':
        if (value && typeof value === 'string' && value.length > FIELD_LENGTHS.FIRST_NAME.max) {
          return VALIDATION_MESSAGES.TOO_LONG(FIELD_LENGTHS.FIRST_NAME.max);
        }
        break;
      
      case 'lastName':
        if (value && typeof value === 'string' && value.length > FIELD_LENGTHS.LAST_NAME.max) {
          return VALIDATION_MESSAGES.TOO_LONG(FIELD_LENGTHS.LAST_NAME.max);
        }
        break;
      
      case 'phoneNumber':
        if (value && typeof value === 'string' && !VALIDATION_PATTERNS.PHONE.test(value)) {
          return VALIDATION_MESSAGES.INVALID_PHONE;
        }
        break;
      
      case 'verificationCode':
        if (!value) return VALIDATION_MESSAGES.REQUIRED;
        if (typeof value === 'string' && (value.length < 4 || value.length > 8)) {
          return 'Verification code must be 4-8 characters';
        }
        break;
      
      case 'profilePicture':
        if (value instanceof File) {
          if (value.size > FORM_CONFIG.MAX_FILE_SIZE) {
            return VALIDATION_MESSAGES.FILE_TOO_LARGE('10MB');
          }
          if (!FORM_CONFIG.ALLOWED_IMAGE_TYPES.includes(value.type)) {
            return VALIDATION_MESSAGES.INVALID_FILE_TYPE(FORM_CONFIG.ALLOWED_IMAGE_TYPES.join(', '));
          }
        }
        break;
    }
    return undefined;
  }, []);

  const updateField = useCallback((field: keyof FormState, value: string | File | null) => {
    setState(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setValidation(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      touched: { ...prev.touched, [field]: true }
    }));
  }, [validateField]);

  const validateForm = useCallback((step: AuthStep): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (step === 'login' || step === 'signup') {
      const emailError = validateField('email', state.email);
      if (emailError) {
        errors.email = emailError;
        isValid = false;
      }
    }

    if (step === 'signup') {
      const firstNameError = validateField('firstName', state.firstName);
      const lastNameError = validateField('lastName', state.lastName);
      const phoneError = validateField('phoneNumber', state.phoneNumber);
      const profileError = validateField('profilePicture', state.profilePicture);

      if (firstNameError) errors.firstName = firstNameError;
      if (lastNameError) errors.lastName = lastNameError;
      if (phoneError) errors.phoneNumber = phoneError;
      if (profileError) errors.profilePicture = profileError;

      if (firstNameError || lastNameError || phoneError || profileError) {
        isValid = false;
      }
    }

    if (step === 'verify') {
      const codeError = validateField('verificationCode', state.verificationCode);
      if (codeError) {
        errors.verificationCode = codeError;
        isValid = false;
      }
    }

    setValidation(prev => ({ ...prev, errors, isValid }));
    return isValid;
  }, [state, validateField]);

  return {
    state,
    validation,
    updateField,
    validateForm,
    setState,
    setValidation
  };
};

// Advanced LoginForm component
export const LoginForm: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [securityFeatures] = useState({
    encryption: true,
    twoFactor: true,
    biometric: false,
    auditLogging: true
  });

  // Form validation hook
  const {
    state: formState,
    validation,
    updateField,
    validateForm,
    setState: setFormState,
    setValidation
  } = useFormValidation({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '',
    region: '',
    verificationCode: '',
    profilePicture: null
  });

  // Refs and animations
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const stepControls = useAnimation();

  // Departments and regions data
  const departments = useMemo(() => [
    'Engineering', 'Data Science', 'Analytics', 'Compliance',
    'Security', 'Operations', 'Finance', 'Marketing', 'Sales',
    'Human Resources', 'Legal', 'Product Management'
  ], []);

  const regions = useMemo(() => [
    'North America', 'Europe', 'Asia Pacific', 'Latin America',
    'Middle East', 'Africa', 'Australia', 'Other'
  ], []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.3 }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Effects
  useEffect(() => {
    controls.start('visible');
  }, [controls]);

  useEffect(() => {
    stepControls.start('visible');
  }, [currentStep, stepControls]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Event handlers
  const handleEmailAuth = useCallback(async (isSignup: boolean = false) => {
    if (!validateForm(isSignup ? 'signup' : 'login')) return;

    setIsLoading(true);
    setValidation(prev => ({ ...prev, errors: { ...prev.errors, general: undefined } }));

    try {
      if (isSignup) {
        const signupData: SignupRequest = {
          email: formState.email,
          first_name: formState.firstName || undefined,
          last_name: formState.lastName || undefined,
          phone_number: formState.phoneNumber || undefined,
          department: formState.department || undefined,
          region: formState.region || undefined
        };

        await authService.signupWithEmail(signupData);
      } else {
        const loginData: LoginRequest = { email: formState.email };
        await authService.loginWithEmail(loginData);
      }

      setCurrentStep('verify');
      setResendCooldown(60);
      
      // Animate step transition
      await stepControls.start('exit');
      await stepControls.start('visible');
      
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          general: error.message || 'Authentication failed. Please try again.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState, validateForm, setValidation, stepControls]);

  const handleOAuthAuth = useCallback(async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setAuthMethod(provider);

    try {
      const response = await authService.handleOAuthPopup(provider);
      setAuthResponse(response);
      setCurrentStep('success');
      
      // Trigger success animation
      await controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      });
      
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          general: error.message || `${provider} authentication failed. Please try again.` 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [controls, setValidation]);

  const handleVerifyCode = useCallback(async () => {
    if (!validateForm('verify')) return;

    setIsLoading(true);
    setValidation(prev => ({ ...prev, errors: { ...prev.errors, general: undefined } }));

    try {
      const verifyData: VerifyCodeRequest = {
        email: formState.email,
        code: formState.verificationCode
      };

      const response = await authService.verifyEmailCode(verifyData);
      setAuthResponse(response.data);
      setCurrentStep('success');
      
      // Success animation
      await controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.6 }
      });
      
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          verificationCode: error.message || 'Invalid verification code. Please try again.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState.email, formState.verificationCode, validateForm, setValidation, controls]);

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await authService.resendVerificationCode(formState.email);
      setResendCooldown(60);
    } catch (error: any) {
      setValidation(prev => ({
        ...prev,
        errors: { 
          ...prev.errors, 
          general: error.message || 'Failed to resend verification code.' 
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [formState.email, resendCooldown, setValidation]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateField('profilePicture', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [updateField]);

  const handleRemoveProfilePicture = useCallback(() => {
    updateField('profilePicture', null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [updateField]);

  const handleStepBack = useCallback(() => {
    if (currentStep === 'verify') {
      setCurrentStep('signup');
    } else if (currentStep === 'signup') {
      setCurrentStep('login');
    }
  }, [currentStep]);

  // Render methods
  const renderSecurityFeatures = () => (
    <motion.div 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">Enterprise Security</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${securityFeatures.encryption ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-blue-800">256-bit Encryption</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${securityFeatures.twoFactor ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-blue-800">2FA Ready</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${securityFeatures.auditLogging ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-blue-800">Audit Logging</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${securityFeatures.biometric ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-blue-800">Biometric Support</span>
        </div>
      </div>
    </motion.div>
  );

  const renderFormField = (
    field: keyof FormState,
    label: string,
    type: string = 'text',
    icon?: React.ReactNode,
    placeholder?: string,
    options?: string[]
  ) => (
    <motion.div variants={fieldVariants} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {['email', 'verificationCode'].includes(field) && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{icon}</div>
          </div>
        )}
        
        {options ? (
          <select
            value={formState[field] as string}
            onChange={(e) => updateField(field, e.target.value)}
            className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validation.errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={formState[field] as string}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={placeholder}
            className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validation.errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            maxLength={
              field === 'email' ? FIELD_LENGTHS.EMAIL.max :
              field === 'firstName' ? FIELD_LENGTHS.FIRST_NAME.max :
              field === 'lastName' ? FIELD_LENGTHS.LAST_NAME.max :
              field === 'phoneNumber' ? FIELD_LENGTHS.PHONE_NUMBER.max :
              undefined
            }
          />
        )}
        
        {validation.errors[field] && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </motion.div>
        )}
      </div>
      
      {validation.errors[field] && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center space-x-1"
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>{validation.errors[field]}</span>
        </motion.p>
      )}
    </motion.div>
  );

  const renderProfilePictureUpload = () => (
    <motion.div variants={fieldVariants} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
      <div className="flex items-center space-x-4">
        <div className="relative">
          {profilePreview ? (
            <div className="relative">
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveProfilePicture}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <PhotoIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <PhotoIcon className="h-4 w-4 mr-2" />
            Choose Photo
          </button>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, GIF up to 10MB
          </p>
        </div>
      </div>
      
      {validation.errors.profilePicture && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center space-x-1"
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>{validation.errors.profilePicture}</span>
        </motion.p>
      )}
    </motion.div>
  );

  const renderLoginStep = () => (
    <motion.div
      key="login"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <DataGovernanceIcon className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your Data Governance Platform</p>
      </div>

      {renderSecurityFeatures()}

      <div className="space-y-4">
        <motion.div variants={fieldVariants}>
          {renderFormField('email', 'Email Address', 'email', <EnvelopeIcon />, 'Enter your email address')}
        </motion.div>

        <motion.div variants={fieldVariants} className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me for 30 days
          </label>
        </motion.div>

        <motion.button
          variants={fieldVariants}
          type="button"
          onClick={() => handleEmailAuth(false)}
          disabled={isLoading || !validation.isValid}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <>
              Continue with Email
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </motion.button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            variants={fieldVariants}
            type="button"
            onClick={() => handleOAuthAuth('google')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GoogleIcon className="h-5 w-5 mr-2" />
            Google
          </motion.button>
          
          <motion.button
            variants={fieldVariants}
            type="button"
            onClick={() => handleOAuthAuth('microsoft')}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MicrosoftIcon className="h-5 w-5 mr-2" />
            Microsoft
          </motion.button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setCurrentStep('signup')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderSignupStep = () => (
    <motion.div
      key="signup"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <SparklesIcon className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600">Join our advanced Data Governance Platform</p>
      </div>

      <div className="space-y-4">
        <motion.div variants={fieldVariants}>
          {renderFormField('email', 'Email Address', 'email', <EnvelopeIcon />, 'Enter your work email')}
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={fieldVariants}>
            {renderFormField('firstName', 'First Name', 'text', <UserIcon />, 'John')}
          </motion.div>
          <motion.div variants={fieldVariants}>
            {renderFormField('lastName', 'Last Name', 'text', <UserIcon />, 'Doe')}
          </motion.div>
        </div>

        <motion.div variants={fieldVariants}>
          {renderFormField('phoneNumber', 'Phone Number', 'tel', <DevicePhoneMobileIcon />, '+1 (555) 123-4567')}
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={fieldVariants}>
            {renderFormField('department', 'Department', 'text', <BuildingOfficeIcon />, undefined, departments)}
          </motion.div>
          <motion.div variants={fieldVariants}>
            {renderFormField('region', 'Region', 'text', <MapPinIcon />, undefined, regions)}
          </motion.div>
        </div>

        {renderProfilePictureUpload()}

        <motion.div variants={fieldVariants} className="flex items-start">
          <input
            id="agree-terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
              Privacy Policy
            </a>
          </label>
        </motion.div>

        <motion.button
          variants={fieldVariants}
          type="button"
          onClick={() => handleEmailAuth(true)}
          disabled={isLoading || !validation.isValid || !agreedToTerms}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <>
              Create Account
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </motion.button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleStepBack}
            className="text-sm text-gray-600 hover:text-gray-500 font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to sign in
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderVerifyStep = () => (
    <motion.div
      key="verify"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <KeyIcon className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="text-gray-600">
          We've sent a verification code to{' '}
          <span className="font-medium text-gray-900">{formState.email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <motion.div variants={fieldVariants}>
          {renderFormField('verificationCode', 'Verification Code', 'text', <KeyIcon />, 'Enter 6-digit code')}
        </motion.div>

        <motion.button
          variants={fieldVariants}
          type="button"
          onClick={handleVerifyCode}
          disabled={isLoading || !validation.isValid}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <>
              Verify Email
              <CheckCircleIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </motion.button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleStepBack}
            className="text-sm text-gray-600 hover:text-gray-500 font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to sign up
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      key="success"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
      >
        <CheckCircleIcon className="h-10 w-10 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-gray-600">
          You've successfully signed in to your Data Governance Platform
        </p>
        {authResponse?.user && (
          <p className="text-sm text-gray-500">
            Signed in as {authResponse.user.display_name || authResponse.user.email}
          </p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CpuChipIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Platform Features</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Global Data Discovery</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Advanced Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-800">AI-Powered Insights</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Compliance Ready</span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        type="button"
        onClick={() => window.location.href = '/dashboard'}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Continue to Dashboard
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </motion.button>
    </motion.div>
  );

  // Error display
  const renderErrorMessage = () => {
    if (!validation.errors.general) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{validation.errors.general}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {renderErrorMessage()}
          
          <AnimatePresence mode="wait">
            {currentStep === 'login' && renderLoginStep()}
            {currentStep === 'signup' && renderSignupStep()}
            {currentStep === 'verify' && renderVerifyStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        <p>© 2024 Data Governance Platform. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/help" className="text-blue-600 hover:text-blue-500 transition-colors">
            Help Center
          </a>
          <a href="/contact" className="text-blue-600 hover:text-blue-500 transition-colors">
            Contact Support
          </a>
          <a href="/status" className="text-blue-600 hover:text-blue-500 transition-colors">
            System Status
          </a>
        </div>
      </motion.div>
    </div>
  );
};