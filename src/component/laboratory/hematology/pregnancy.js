import React from 'react'

export default function PregnancyTest() {
    return (
        <div>
            <label>Sample type</label>
            <select>
                <option value="urine">urine</option>
                <option value="serum">serum</option>
            </select>
            <label>Result</label>
            <select>
                <option value="positive">positive</option>
                <option value="negative">negative</option>
            </select>
        </div>
    )
}
