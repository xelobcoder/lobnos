import React from 'react';

const RegionalResults = () => {
    const region = "Greater Accra";
    const constituencies = 34;
    const ndcPercentage = 82.35;
    const nppPercentage = 14.71;
    const ndcSeats = 28;
    const nppSeats = 5;
    const gcppSeats = 0;
    const gfpSeats = 0;
    const gumSeats = 0;
    const lpgSeats = 0;
    const ndpSeats = 0;
    const cdpSeats = 0;
    const pncSeats = 0;
    const pppSeats = 0;

    const progressBarContainerStyle = {
        backgroundColor: '#2c3e50',
        borderRadius: '5px',
        height: '10px',
        width: '80%', // Adjusted width to 80%
        margin: '5px 0',
        position: 'relative',
        overflow: 'hidden',
    };

    const progressBarNDCStyle = {
        backgroundColor: '#2ecc71', // Green for NDC
        width: `${ndcPercentage}%`,
        height: '100%',
        float: 'left',
    };

    const progressBarNPPStyle = {
        backgroundColor: '#3498db', // Blue for NPP
        width: `${nppPercentage}%`,
        height: '100%',
        float: 'left',
    };

    const partyRowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Align items to start and end
        padding: '5px 0',
        borderBottom: '1px solid #444', // Add a subtle border between rows
    };

    const partyLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        width: '40%', // Adjusted width to accommodate labels
    };

    const percentageStyle = {
        width: '20%', // Adjusted width to accommodate percentages
        textAlign: 'right',
    };

    const seatsStyle = {
        width: '10%',
        textAlign: 'right',
    };

    const dotStyle = (color) => ({
        height: '10px',
        width: '10px',
        backgroundColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '5px',
    });

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: 'white', backgroundColor: '#2c3e50', padding: '20px' }} className=' container my-5 br-5 '>
            <h2>Regional Map</h2>
            <h3>{region}</h3>
            <p>{constituencies} constituencies</p>

            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#2ecc71')}></span>
                    NDC
                </div>
                <div style={percentageStyle}>{ndcPercentage}%</div>
                <div style={progressBarContainerStyle}>
                    <div style={progressBarNDCStyle}></div>
                </div>
                <div style={seatsStyle}>{ndcSeats}</div>
            </div>

            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#3498db')}></span>
                    NPP
                </div>
                <div style={percentageStyle}>{nppPercentage}%</div>
                <div style={progressBarContainerStyle}>
                    <div style={progressBarNPPStyle}></div>
                </div>
                <div style={seatsStyle}>{nppSeats}</div>
            </div>

            {/* Placeholder rows for other parties - you can expand this as needed */}
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    GCPP
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{gcppSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    GFP
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{gfpSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    GUM
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{gumSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    LPG
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{lpgSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    NDP
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{ndpSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    CPP
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{cdpSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    PNC
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{pncSeats}</div>
            </div>
            <div style={partyRowStyle}>
                <div style={partyLabelStyle}>
                    <span style={dotStyle('#95a5a6')}></span>
                    PPP
                </div>
                <div style={percentageStyle}>0%</div>
                <div style={progressBarContainerStyle}></div>
                <div style={seatsStyle}>{pppSeats}</div>
            </div>
        </div>
    );
};

export default RegionalResults;
