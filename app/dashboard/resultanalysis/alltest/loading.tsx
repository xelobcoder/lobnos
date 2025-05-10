import React from 'react';

export default function Loading() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc"
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: "5px solid #e0e7ef",
        borderTop: "5px solid #1976d2",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <div style={{ marginTop: 18, color: "#1976d2", fontWeight: 500, fontSize: 18 }}>
        Loading test results...
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}
