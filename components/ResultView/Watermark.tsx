import React from 'react';

interface WatermarkProps {
    text: string;
    subText?: string;
}

const Watermark: React.FC<WatermarkProps> = ({ text, subText }) => {
    return (
        <div 
            className="watermark-overlay"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0, // Lowered to stay behind the content (visually below)
                overflow: 'hidden',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Centered Circular Watermark - Increased by 50% */}
            <div 
                className="watermark-seal"
                style={{
                    width: '52.5vw', // Increased from 35vw (35 * 1.5)
                    height: '52.5vw',
                    maxWidth: '600px', // Increased from 400px (400 * 1.5)
                    maxHeight: '600px',
                    minWidth: '375px', // Increased from 250px (250 * 1.5)
                    minHeight: '375px',
                    border: '12px double rgba(0,0,0,0.06)', // Slightly thicker border
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-25deg)',
                    padding: '45px',
                    textAlign: 'center',
                }}
            >
                <div style={{
                    border: '3px solid rgba(0,0,0,0.03)',
                    borderRadius: '50%',
                    width: '95%',
                    height: '95%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px'
                }}>
                    <span 
                        style={{
                            fontSize: 'calc(18px + 1.8vw)', // Scaled up font
                            fontWeight: '900',
                            color: 'rgba(0,0,0,0.07)',
                            textTransform: 'uppercase',
                            letterSpacing: '6px',
                            lineHeight: '1.1',
                            fontFamily: 'serif',
                            wordBreak: 'break-word',
                            maxWidth: '100%'
                        }}
                    >
                        {text}
                    </span>
                    {subText && (
                        <span 
                            style={{
                                fontSize: 'calc(12px + 0.9vw)', // Scaled up subtext
                                fontWeight: '700',
                                color: 'rgba(0,0,0,0.06)',
                                textTransform: 'uppercase',
                                letterSpacing: '3px',
                                marginTop: '15px',
                                fontFamily: 'monospace'
                            }}
                        >
                            ID: {subText}
                        </span>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .watermark-overlay {
                        display: flex !important;
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .watermark-seal {
                        width: 120mm !important; /* Increased from 80mm to 120mm (80 * 1.5) */
                        height: 120mm !important;
                        border-color: rgba(0,0,0,0.06) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Watermark;
