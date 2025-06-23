// Authentication system
class AuthManager {
  constructor(storage) {
    this.storage = storage;
    this.currentUser = null;
    this.currentAdmin = null;
  }

  // Password validation
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Email validation
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // User registration
  async registerUser(userData) {
    try {
      if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.type) {
        throw new Error('All fields are required');
      }

      if (!this.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Check if user already exists
      const existingUser = this.storage.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user object
      const user = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // Not hashed for simplicity
        phone: userData.phone,
        type: userData.type,
        verified: userData.type === 'donor',
        registeredAt: new Date().toISOString()
      };

      this.storage.saveUser(user);

      //verification request
      if (userData.type === 'receiver' && userData.document) {
        const verification = {
          userEmail: userData.email,
          userName: userData.name,
          documentData: userData.document,
          userType: 'receiver'
        };
        this.storage.savePendingVerification(verification);
      }

      return {
        success: true,
        message: userData.type === 'receiver' 
          ? 'Registration successful! Your account is pending verification. You will be able to login once approved.'
          : 'Registration successful! You can now login.',
        user: user
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // User login
  async loginUser(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = this.storage.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (user.password !== password) {
        throw new Error('Invalid email or password');
      }
}