import React from 'react'

export default function NoDataAvailable({message= "No Data Available"}) {
    return (
        <div className="heightedBorder p-4 bg-secondary-subtle">{message}</div>
    )
}
