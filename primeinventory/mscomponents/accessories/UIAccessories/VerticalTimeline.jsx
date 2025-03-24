import React from 'react';

export default function VecticalTimeline({data}) {

    return (
        <div className="timeline pls-color">
            <ol className="timelineList">
                {Array.isArray(data) && data.length > 0 && data.map((entry, index) => (
                    <li key={index} className="timelineItem">
                        <div className="timelineDot" style={{color:entry.color ?  entry.color : ""}} />
                        <div className="timelineContent text-capitalize">
                            <span>{entry.event} {entry.feed}</span>
                        </div>
                    </li>
                ))}
            </ol>
            <style jsx>{`
                .timeline {
                    background: inherit;
                }
                .timelineList {
                    list-style: none;
                    padding: 0;
                }
                .timelineItem {
                    position: relative;
                    padding-left: 10px;
                }
                .timelineDot {
                    position: absolute;
                    left: 0;
                    top: 15px;
                    width: 12px;
                    height: 12px;
                    background: #007bff;
                    border-radius: 50%;
                }
                .timelineItem:not(:last-child)::before {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 25px;
                    width: 2px;
                    height: calc(100% );
                    background: #007bff;
                }
                .timelineContent {
                    background: #ffffff;
                    border-radius: 5px;
                    padding: 15px;
                }
            `}</style>
        </div>
    );
};
