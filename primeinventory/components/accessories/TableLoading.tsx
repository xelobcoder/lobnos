import React from 'react'

export default function TableLoading({ span }: { span: number }) {
    return (
        <tbody>
            <tr>
                <td colSpan={span}>
                    <div>
                        Loading data Please.wait !!
                    </div>
                </td>
            </tr>
        </tbody>
    )
}
