import styles from './Loader.module.css';

export default function Loader({ w = 20, h = 20, color = '#2563eb' }) {
    return (
        <div className={styles.loaderContainer} style={{ width: w, height: h }}>
            <svg 
                className={styles.spinner}
                viewBox="0 0 50 50"
                style={{ 
                    width: w * 0.8,  
                    height: h * 0.8
                }}
            >
                <circle
                    className={styles.path}
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                />
            </svg>
        </div>
    );
}