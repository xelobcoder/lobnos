import React, { useState } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import styles from '../styles/loginPage.module.css';

const LoginPage = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className={styles['login-container']}>
            <div className={styles['login-card']}>
                <div className={styles.header}>
                    <AccountBalanceIcon className={styles.icon} />
                    <h3>Prime Laboratory System</h3>
                    <p>Secure access to your portal</p>
                </div>

                <form onSubmit={handleSubmit} autoComplete='off'  autoSave='off'>
                    <div className={styles['form-group']}>
                        <label htmlFor="username">Username</label>
                        <div className={styles['input-wrapper']}>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={styles['form-input']}
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    <div className={styles['form-group']}>
                        <label htmlFor="password">Password</label>
                        <div className={styles['input-wrapper']}>
                            <input
                                id="password"
                                name="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                required
                                className={styles['form-input']}
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className={styles['password-toggle']}
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                {isPasswordVisible ? (
                                    <VisibilityOffIcon className={styles['small-icon']} />
                                ) : (
                                    <VisibilityIcon className={styles['small-icon']} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={styles['security-notice']}>
                        <LockIcon className={styles['lock-icon']} />
                        <span>Protected by enterprise-grade security</span>
                    </div>

                    <button type="submit" className={styles['submit-button']} disabled={isLoading}>
                        {isLoading ? (
                            <div className={styles.spinner} />
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className={styles.links}>
                        <a href="#">Forgot password?</a>
                        <a href="#">Contact support</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;