import { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { CheckCircle, LockClock } from '@mui/icons-material';

interface TimelineEvent {
    id: number;
    date: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming';
}

interface TimelineProps {
    ascensionId: number;
    billedOn: string;
    collectionStartDate: string;
    collectionEndDate: string;
    processingStartDate: string;
    resultEntryStart: string;
    resultEntryEnd: string;
    patientName: string;
    test: string;
    preTAT: string;
    processingTAT: string;
    postTAT: string;
}

const VerticalTimeline = ({
    ascensionId,
    billedOn,
    collectionStartDate,
    collectionEndDate,
    processingStartDate,
    resultEntryStart,
    resultEntryEnd,
    patientName,
    test,
    preTAT,
    processingTAT,
    postTAT,
}: TimelineProps) => {
    const [events, setEvents] = useState < TimelineEvent[] > ([]);

    useEffect(() => {
        const timelineEvents: TimelineEvent[] = [
            {
                id: 1,
                date: billedOn,
                label: 'Billed',
                status: 'completed',
            },
            {
                id: 2,
                date: collectionStartDate,
                label: 'Collection Started',
                status: 'completed',
            },
            {
                id: 3,
                date: collectionEndDate,
                label: 'Collection Completed',
                status: 'completed',
            },
            {
                id: 4,
                date: processingStartDate,
                label: 'Processing Started',
                status: 'completed',
            },
            {
                id: 5,
                date: resultEntryStart,
                label: 'Result Entry Started',
                status: 'completed',
            },
            {
                id: 6,
                date: resultEntryEnd,
                label: 'Result Entry Completed',
                status: 'completed',
            },
        ];

        setEvents(timelineEvents);
    }, [
        billedOn,
        collectionStartDate,
        collectionEndDate,
        processingStartDate,
        resultEntryStart,
        resultEntryEnd,
    ]);

    return (
        <div className="container">
            <div className="card mx-auto" style={{ maxWidth: '42rem' }}>
                <div className="card-body">
                    <div className="mb-4">
                        <span className="badge bg-primary rounded-pill">
                            Test #{ascensionId}
                        </span>
                        <h2 className="mt-3 h4">{patientName}</h2>
                        <p className="text-muted">{test}</p>
                    </div>

                    <div className="timeline">
                        {events.map((event, index) => (
                            <div key={event.id} className="timeline-item position-relative mb-4">
                                {index !== events.length - 1 && (
                                    <div className="timeline-line position-absolute" style={{
                                        left: '22px',
                                        top: '40px',
                                        width: '2px',
                                        height: '100%',
                                        background: '#dee2e6'
                                    }} />
                                )}

                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            {event.status === 'completed' ? (
                                                <CheckCircle fontSize='small' />
                                            ) : (
                                                <LockClock  fontSize='small'/>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">{event.label}</h3>
                                                <small className="text-muted">
                                                    {format(new Date(event.date), 'PPpp')}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row mt-4">
                        <div className="col-md-4 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="h6 text-muted mb-2">Pre TAT</h4>
                                    <p className="h5 mb-0">{preTAT}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="h6 text-muted mb-2">Processing TAT</h4>
                                    <p className="h5 mb-0">{processingTAT}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="h6 text-muted mb-2">Post TAT</h4>
                                    <p className="h5 mb-0">{postTAT}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerticalTimeline;