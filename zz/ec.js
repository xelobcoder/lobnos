import React from 'react';

const ElectionResults = () => {
    const nppSeats2024 = 5;
    const nppSeats2020 = 14;
    const ndcSeats2024 = 28;
    const ndcSeats2020 = 20;
    const totalRegisteredVoters = 3752953;
    const validVotes = 1828667;
    const rejectedVotes = 1129;
    const totalVotesCast = 1829796;
    const percentageVotesCast = 48.76;

    // Calculate net loss and gain
    const nppNetLoss = nppSeats2020 - nppSeats2024;
    const ndcNetGain = ndcSeats2024 - ndcSeats2020;

    // Calculate the percentages for the progress bar
    const nppPercentage = (nppSeats2024 / (nppSeats2024 + ndcSeats2024)) * 100;
    const ndcPercentage = (ndcSeats2024 / (nppSeats2024 + ndcSeats2024)) * 100;

    const progressBarContainerStyle = {
        backgroundColor: '#2c3e50',
        borderRadius: '10px',
        height: '20px',
        width: '50%',
        margin: '10px 0',
        position: 'relative',
        overflow: 'hidden',
    };

    const progressBarNPPStyle = {
        backgroundColor: '#3498db',
        width: `${nppPercentage}%`,
        height: '100%',
        float: 'left',
    };

    const progressBarNDCStyle = {
        backgroundColor: '#2ecc71',
        width: `${ndcPercentage}%`,
        height: '100%',
        float: 'left',
    };

    const markStyle = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '0.8em',
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: 'white', backgroundColor: '#2c3e50', padding: '20px' }}  className='container my-5 br-5'>
            <h2>Parliamentary Results</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <img src="https://pplx-res.cloudinary.com/image/upload/v1739902971/user_uploads/HAGcUSrNveyDEVI/Screenshot_18-2-2025_191919_elections.3news.com.jpg" alt="NPP Logo" style={{ width: '50px', height: 'auto' }} />
                    <p><b>{nppSeats2024}</b> NPP</p>
                    <p>2024: {nppSeats2024} seats</p>
                    <p>2020: {nppSeats2020} seats</p>
                    <p style={{ color: 'red' }}>Net Loss {nppNetLoss}</p>
                </div>

                <div style={{ ...progressBarContainerStyle }}>
                    <div style={{ ...progressBarNPPStyle }}></div>
                    <div style={{ ...progressBarNDCStyle }}></div>
                    <span style={markStyle}>50% Mark</span>
                </div>

                <div>
                    <p>NDC <b>{ndcSeats2024}</b></p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/NDC_logo.svg/1200px-NDC_logo.svg.png" alt="NDC Logo" style={{ width: '50px', height: 'auto' }} />
                    <p>2024: {ndcSeats2024} seats</p>
                    <p>2020: {ndcSeats2020} seats</p>
                    <p style={{ color: 'green' }}>Net Gain {ndcNetGain}</p>
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>Total Registered Voters: {totalRegisteredVoters}</div>
                <div>Valid Votes: {validVotes}</div>
                <div>Rejected Votes: {rejectedVotes}</div>
                <div>Total Votes Cast: {totalVotesCast} ({percentageVotesCast}%)</div>
            </div>
        </div>
    );
};

export default ElectionResults;
