// Input validation functions
const validations = {
    // Name validation (no spaces at start, single spaces between words)
    validateName: (name) => {
        if (!name) {
            return 'Name is required';
        }

        // Check for leading or trailing spaces
        if (name.startsWith(' ') || name.endsWith(' ')) {
            return 'Name cannot start or end with spaces';
        }

        // Check if name contains only spaces
        if (name.trim().length === 0) {
            return 'Name cannot be empty or contain only spaces';
        }

        // Check for multiple consecutive spaces
        if (/\s\s+/.test(name)) {
            return 'Name cannot contain consecutive spaces';
        }

        // Check if name contains at least 2 characters (not counting spaces)
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters long';
        }

        // Check if name contains only letters, spaces (single space between words), and basic punctuation
        if (!/^[A-Za-z]+(?:[ ][A-Za-z]+)*$/.test(name)) {
            return 'Name can only contain letters and single spaces between words';
        }

        return '';  // Empty string means validation passed
    },

    // Email validation
    validateEmail: (email) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return { isValid: false, message: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true };
    },

    // Password validation
    validatePassword: (password) => {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }
        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
        }
        return { isValid: true };
    },

    // Subject validation
    validateSubject: (subject) => {
        const trimmedSubject = subject.trim();
        if (!trimmedSubject) {
            return { isValid: false, message: 'Subject is required' };
        }
        if (trimmedSubject.length < 3) {
            return { isValid: false, message: 'Subject must be at least 3 characters long' };
        }
        return { isValid: true };
    },

    // Message validation
    validateMessage: (message) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            return { isValid: false, message: 'Message is required' };
        }
        if (trimmedMessage.length < 10) {
            return { isValid: false, message: 'Message must be at least 10 characters long' };
        }
        return { isValid: true };
    },

    // Price validation
    validatePrice: (price) => {
        if (!price) {
            return { isValid: false, message: 'Price is required' };
        }
        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            return { isValid: false, message: 'Price must be a valid number' };
        }
        if (priceNum <= 0) {
            return { isValid: false, message: 'Price must be greater than 0' };
        }
        return { isValid: true };
    },

    // Description validation
    validateDescription: (description) => {
        const trimmedDesc = description.trim();
        if (!trimmedDesc) {
            return { isValid: false, message: 'Description is required' };
        }
        if (trimmedDesc.length < 10) {
            return { isValid: false, message: 'Description must be at least 10 characters long' };
        }
        return { isValid: true };
    },

    // Item name validation
    validateItemName: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            return { isValid: false, message: 'Item name is required' };
        }
        if (name.startsWith(' ')) {
            return { isValid: false, message: 'Item name cannot start with a space' };
        }
        if (trimmedName.length < 3) {
            return { isValid: false, message: 'Item name must be at least 3 characters long' };
        }
        if (trimmedName.length > 100) {
            return { isValid: false, message: 'Item name cannot exceed 100 characters' };
        }
        if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-_.,()]*$/.test(trimmedName)) {
            return { isValid: false, message: 'Item name must start with a letter or number and can only contain letters, numbers, spaces, and basic punctuation' };
        }
        return { isValid: true };
    },

    // Search input validation
    validateSearchInput: (searchTerm) => {
        const trimmedSearch = searchTerm.trim();
        if (!trimmedSearch) {
            return { isValid: false, message: 'Please enter a search term' };
        }
        if (searchTerm.startsWith(' ')) {
            return { isValid: false, message: 'Search term cannot start with a space' };
        }
        if (trimmedSearch.length < 2) {
            return { isValid: false, message: 'Search term must be at least 2 characters long' };
        }
        if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-_.,()]*$/.test(trimmedSearch)) {
            return { isValid: false, message: 'Search term must start with a letter or number and can only contain letters, numbers, spaces, and basic punctuation' };
        }
        return { isValid: true };
    },

    // Phone number validation
    validatePhone: (phone) => {
        const trimmedPhone = phone.trim();
        if (!trimmedPhone) {
            return { isValid: false, message: 'Phone number is required' };
        }
        if (phone.startsWith(' ')) {
            return { isValid: false, message: 'Phone number cannot start with a space' };
        }
        if (!/^[0-9]{10}$/.test(trimmedPhone)) {
            return { isValid: false, message: 'Please enter a valid 10-digit phone number' };
        }
        return { isValid: true };
    },

    // Address validation
    validateAddress: (address) => {
        const trimmedAddress = address.trim();
        if (!trimmedAddress) {
            return { isValid: false, message: 'Address is required' };
        }
        if (address.startsWith(' ')) {
            return { isValid: false, message: 'Address cannot start with a space' };
        }
        if (trimmedAddress.length < 10) {
            return { isValid: false, message: 'Address must be at least 10 characters long' };
        }
        if (trimmedAddress.length > 200) {
            return { isValid: false, message: 'Address cannot exceed 200 characters' };
        }
        if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-_.,()/]*$/.test(trimmedAddress)) {
            return { isValid: false, message: 'Address must start with a letter or number and can only contain letters, numbers, spaces, and basic punctuation' };
        }
        return { isValid: true };
    }
};

// Add validation event listeners to form inputs
function addInputValidations() {
    // Name inputs
    document.querySelectorAll('input[type="text"][id*="name"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const error = validations.validateName(e.target.value);
            if (error) {
                input.setCustomValidity(error);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Email inputs
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validateEmail(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Password inputs
    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validatePassword(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Subject inputs
    document.querySelectorAll('input[id*="subject"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validateSubject(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Message textareas
    document.querySelectorAll('textarea[id*="message"]').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const validation = validations.validateMessage(e.target.value);
            if (!validation.isValid) {
                textarea.setCustomValidity(validation.message);
            } else {
                textarea.setCustomValidity('');
            }
        });
    });

    // Price inputs
    document.querySelectorAll('input[id*="price"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validatePrice(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Description textareas
    document.querySelectorAll('textarea[id*="description"]').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const validation = validations.validateDescription(e.target.value);
            if (!validation.isValid) {
                textarea.setCustomValidity(validation.message);
            } else {
                textarea.setCustomValidity('');
            }
        });
    });

    // Item name inputs
    document.querySelectorAll('input[id*="itemName"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validateItemName(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Search input
    document.querySelectorAll('input[id*="searchInput"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validateSearchInput(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Phone inputs
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const validation = validations.validatePhone(e.target.value);
            if (!validation.isValid) {
                input.setCustomValidity(validation.message);
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Address textareas
    document.querySelectorAll('textarea[id*="address"]').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const validation = validations.validateAddress(e.target.value);
            if (!validation.isValid) {
                textarea.setCustomValidity(validation.message);
            } else {
                textarea.setCustomValidity('');
            }
        });
    });
}

// Initialize validations when DOM is loaded
document.addEventListener('DOMContentLoaded', addInputValidations);