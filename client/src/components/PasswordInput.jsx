import { useState } from 'react';

export default function PasswordInput({ id, label, value, onChange, placeholder, autoComplete, minLength }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">{label}</label>
            <div className="password-field">
                <input
                    type={visible ? 'text' : 'password'}
                    className="form-control pe-5"
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    minLength={minLength}
                    required
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
            </div>
        </div>
    );
}
