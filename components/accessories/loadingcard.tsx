import React from 'react'

export default function LoadingCard() {
  return (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "40vh",
        boxShadow: "",
        background: "#f8fafc",
        borderRadius: 12,
        margin: "40px auto",
        maxWidth: 400
    }}>
        <div className="lds-dual-ring" style={{
            display: "inline-block",
            width: 64,
            height: 64,
            marginBottom: 18
        }} />
        <div style={{
            fontWeight: 600,
            fontSize: "1.2rem",
            color: "#1976d2",
            marginBottom: 4
        }}>
            Loading Critical Value Alerts...
        </div>
        <div style={{
            color: "#64748b",
            fontSize: "1rem"
        }}>
            Please wait while we fetch the latest data.
        </div>
    </div>
  )
}
