import nextVitals from 'eslint-config-next/core-web-vitals';

export default [
    ...nextVitals,
    {ignores: ['.next*/**', '.desktop-runtime/**', 'dist/**', 'out/**', 'node_modules/**']},
];
