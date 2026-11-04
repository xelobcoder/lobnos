'use client'

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { RiPlayCircleLine, RiLoaderLine, RiSquareLine, RiFlashlightLine } from '@remixicon/react';
import type { CSSProperties } from 'react';

const style = {
    pageContainer: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        backgroundColor: 'var(--theme-card-bg)',
        color: 'var(--bs-body-color)',
        maxWidth: 1200,
    },
    header: {
        textAlign: 'center',
        maxWidth: 900,
        margin: '0 auto',
    },
    mainHeading: {
        fontWeight: 800,
        fontSize: 'clamp(1.3rem, 3vw, 2.1rem)', // reduced
        letterSpacing: '-2px',
        color: 'var(--bs-body-color)',
        lineHeight: 1.1,
    },
    subheading: {
        fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', // reduced
        color: 'var(--bs-secondary-color)',
        maxWidth: 700,
        margin: '1rem auto 0',
    },
    section: {
        display: 'flex',
        flexDirection: 'row', // two columns
        alignItems: 'flex-start',
        gap: '18px',
        height: '100%',
        background: 'var(--bs-secondary-bg)',
        borderRadius: '10px',
        padding: '18px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        marginBottom: '18px',
    },
    sectionLeft: {
        minWidth: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '8px',
    },
    sectionHeader: {
        color: 'var(--bs-primary)',
        fontWeight: 600,
        fontSize: '1.05rem', // reduced
        letterSpacing: '-0.5px',
        margin: 0,
        textAlign: 'center',
    },
    stepList: {
        paddingLeft: '20px',
        listStyle: 'none',
        counterReset: 'step-counter',
        margin: 0,
    },
    stepItem: {
        fontSize: '0.95rem', // reduced
        lineHeight: 1.5,
        color: 'var(--bs-body-color)',
        position: 'relative',
        counterIncrement: 'step-counter',
        marginBottom: '0.7rem',
    },
    stepNumber: {
        position: 'absolute',
        left: '-28px',
        top: '3px',
        backgroundColor: 'var(--bs-tertiary-bg)',
        color: 'var(--bs-secondary-color)',
        fontWeight: 600,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem', // reduced
    },
    code: {
        backgroundColor: 'var(--bs-tertiary-bg)',
        color: 'var(--bs-body-color)',
        padding: '0.15em 0.4em',
        borderRadius: '6px',
        fontSize: '0.85em', // reduced
        fontWeight: 500,
    },
    tipBox: {
        marginTop: '2rem',
        backgroundColor: 'var(--bs-secondary-bg)',
        border: '1px solid #dee2e6',
        borderLeft: '5px solid #0d6efd',
        padding: '1.1rem', // reduced
        borderRadius: '8px',
    },
    tipHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 700,
        fontSize: '1rem', // reduced
        color: '#1a1a1a',
        marginBottom: '0.7rem',
    },
    tipList: {
        paddingLeft: '18px',
        margin: 0,
        fontSize: '0.9rem', // reduced
        color: '#555',
    },
    footer: {
        color: '#888',
        fontSize: '0.8rem', // reduced
        borderTop: '1px solid #e0e0e0',
    },
};

const parseText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|🟡)/g);
    return parts.map((part: string, index: React.Key|null|undefined) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} style={style.code}>{part.slice(1, -1)}</code>;
        }
        if (part === '🟡') {
            return <span key={index} role="img" aria-label="info">🟡</span>;
        }
        return part;
    });
};

const sections = [
    {
        icon: RiPlayCircleLine,
        title: '1. Getting Started',
        steps: [
            '**Select a Patient:** Use the search bar to find and select the patient. Their details will populate at the top.',
            '**Choose Billing Source:** Pick the correct source: `Organization`, `Insurance`, `Clinician`, `Claim`, or `General`.',
            '**Find the Entity:** Search for the specific entity (e.g., insurance company) or use a reference code for a quick lookup.',
        ],
    },
    {
        icon: RiLoaderLine, // changed from RiLayersLine
        title: '2. Building the Invoice',
        steps: [
            '**Add Items:** Add all necessary tests and services to the billing cart. For outsourced tests, click the edit icon to assign an external lab.',
            '**Apply Promo Codes:** Enter a valid promo code to apply a discount. The savings will be reflected in the summary.',
            '**Enter Advance Payment:** Record any advance payment made by the client to calculate the remaining balance.',
        ],
    },
    {
        icon: RiSquareLine, // changed from RiCheckSquareLine
        title: '3. Finalizing the Bill',
        steps: [
            '**Review Summary:** The right-side panel shows a complete breakdown of charges, discounts, and the final total.',
            '**Check for Adjustments:** Look for a 🟡 **Time Based Adjustment** badge. This is applied automatically to eligible tests during the configured daily time period.',
            '**Finalize:** Click the `Bill Client` button to generate the invoice. You can then print a receipt or return to the dashboard.',
        ],
    },
];

const tips = {
    icon: RiFlashlightLine,
    title: 'Power-User Tips',
    items: [
        'Use **Special Codes** in the URL for direct access to a specific entity, bypassing the search step.',
        'The **Reset** button clears the entire form, including any special codes in the URL.',
        'A **Type Mismatch** warning means your Special Code doesn\'t match the selected Billing Source.',
        'Always double-check the **Billing Source** before adding items to prevent errors.',
        'For any issues, contact your system administrator.',
    ],
};

export default function BillingInstructions() {
    // Prepare left column: section titles with icons
    const sectionTitles = sections.map((section, idx) => (
        <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24
        }}>
            <section.icon size={28} color="#0d6efd" />
            <span style={style.sectionHeader as CSSProperties}>{section.title}</span>
        </div>
    ));

    // Prepare right column: all steps for all sections
    let stepCounter = 0;
    const allSteps = sections.map((section, sIdx) => (
        <ol key={sIdx} style={{ ...style.stepList, marginBottom: 24 } as CSSProperties}>
            {section.steps.map((step, stepIndex) => {
                stepCounter++;
                return (
                    <li key={stepIndex} style={style.stepItem as CSSProperties}>
                        <span style={style.stepNumber as CSSProperties}>{stepCounter}</span>
                        {parseText(step)}
                    </li>
                );
            })}
        </ol>
    ));

    return (
        <Container className="my-5 py-4" style={style.pageContainer as CSSProperties}>
            <header className="mb-5 pb-4" style={style.header as CSSProperties}>
                <h1 style={style.mainHeading as CSSProperties}>
                    Multi-Billing System Guide
                </h1>
                <p style={style.subheading as CSSProperties}>
                    A clear, step-by-step guide to help you master the billing process from start to finish.
                </p>
            </header>

            <Row className="g-4">
                <Col lg={4} md={5} sm={12}>
                    <div>{sectionTitles}</div>
                </Col>
                <Col lg={8} md={7} sm={12}>
                    <div>{allSteps}</div>
                </Col>
            </Row>

            <Row className="mt-5 justify-content-center">
                <Col lg={8}>
                    <div style={style.tipBox as CSSProperties}>
                        <h5 style={style.tipHeader as CSSProperties}>
                            <tips.icon size={20} /> {tips.title}
                        </h5>
                        <ul style={style.tipList as CSSProperties}>
                            {tips.items.map((tip, index) => (
                                <li key={index} className="mb-2">{parseText(tip)}</li>
                            ))}
                        </ul>
                    </div>
                </Col>
            </Row>

            <footer className="text-center mt-5 pt-4" style={style.footer as CSSProperties}>
                © {new Date().getFullYear()} Multi-Billing System — Built for efficiency.
            </footer>
        </Container>
    );
}