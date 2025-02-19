import React from 'react';

const PartyConstituencyResults = () => {
    const partyData = [
        { party: 'NPP', constituenciesWon: 5, gained: 0, lost: 9, net: -9, color: '#3498db' },
        { party: 'NDC', constituenciesWon: 28, gained: 8, lost: 0, net: 8, color: '#2ecc71' },
        { party: 'GCPP', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#e74c3c' },
        { party: 'GFP', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#9b59b6' },
        { party: 'GUM', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#f1c40f' },
        { party: 'LPG', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#34495e' },
        { party: 'NDP', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#1abc9c' },
        { party: 'CPP', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#d35400' },
        { party: 'APC', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#8e44ad' },
        { party: 'PAG', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#27ae60' },
        { party: 'LGP', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#c0392b' },
        { party: 'IND', constituenciesWon: 0, gained: 0, lost: 0, net: 0, color: '#7f8c8d' },
    ];

    const totalRegisteredVoters = 3752953;
    const validVotes = 1828667;
    const rejectedVotes = 1129;
    const totalVotesCast = 1829796;
    const percentageVotesCast = 48.76;
    const resultsOutOf = 34;
    const lastUpdated = "Feb 18, 2025 7:18 PM";

    const containerStyle = {
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        backgroundColor: '#E9ECEF', // Changed to a light gray background
        padding: '20px',
        borderRadius: '8px',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
        backgroundColor: 'white', // White background for the table
    };

    const thStyle = {
        backgroundColor: '#F8F9FA', // Very light gray header
        color: 'black',
        padding: '12px',
        textAlign: 'left',
        borderBottom: '1px solid #dee2e6', // Light gray border
    };

    const tdStyle = {
        padding: '12px',
        borderBottom: '1px solid #dee2e6', // Light gray border
        color: 'black',
    };

    const dotStyle = (color) => ({
        height: '8px',
        width: '8px',
        backgroundColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '5px',
    });

    const summaryStyle = {
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // Two-column layout
        gap: '10px',
        backgroundColor: '#F8F9FA', // Light gray for the summary
        padding: '10px',
        borderRadius: '5px',
    };

    const summaryItemStyle = {
        padding: '8px',
        borderRadius: '4px',
        fontSize: '0.9em',
        color: 'black',
    };

    const lastUpdatedStyle = {
        fontSize: '0.7em',
        color: '#6c757d',
        marginTop: '10px',
        textAlign: 'right',
    };

    return (
        <div style={containerStyle} className=' container my-5'>
            <h2>Parliamentary Results</h2>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Party</th>
                        <th style={thStyle}>Constituencies Won</th>
                        <th style={thStyle}>Gained</th>
                        <th style={thStyle}>Lost</th>
                        <th style={thStyle}>Net</th>
                    </tr>
                </thead>
                <tbody>
                    {partyData.map((party, index) => (
                        <tr key={index}>
                            <td style={tdStyle}>
                                <span style={dotStyle(party.color)}></span>
                                {party.party}
                            </td>
                            <td style={tdStyle}>{party.constituenciesWon}</td>
                            <td style={tdStyle}>{party.gained}</td>
                            <td style={tdStyle}>{party.lost}</td>
                            <td style={tdStyle}>{party.net}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={summaryStyle}>
                <div style={summaryItemStyle}>Total Registered Voters: {totalRegisteredVoters.toLocaleString()}</div>
                <div style={summaryItemStyle}>Valid Votes: {validVotes.toLocaleString()}</div>
                <div style={summaryItemStyle}>Rejected Votes: {rejectedVotes.toLocaleString()}</div>
                <div style={summaryItemStyle}>Total Votes Cast: {totalVotesCast.toLocaleString()} ({percentageVotesCast}%)</div>
            </div>

            <p style={lastUpdatedStyle}>
                Results from {resultsOutOf} out of {resultsOutOf} districts. Updated At {lastUpdated}
            </p>
        </div>
    );
};

export default PartyConstituencyResults;
