import style from '../../../../styles/SmsTemplateList.module.css'

export default function ImportantAnalyticsRecorded({ data }) {
    const { average_time_hours, average_time_minutes, average_time_seconds, max_time_hours, max_time_seconds, min_time_hours, min_time_minutes, min_time_seconds } = data;
    console.log(data)

    return (
        <div className={`${style.tablewrapper}`} >
            <div className="p-3 bg-secondary-subtle br-0 text-capitalize ">
                <h5>Timing in sample intiation to completion </h5>
            </div>
            <table className={`${style.table} table`}>
                <thead>
                    <tr>
                        <th>Analysis</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-capitalize">average time in hours</td>
                        <td className="text-capitalize">{average_time_hours} hours</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">average time in minutes</td>
                        <td className="text-capitalize">{average_time_minutes}</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">average time in seconds</td>
                        <td className="text-capitalize">{average_time_seconds}</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">maximun Hours used in sample collection </td>
                        <td className="text-capitalize">{max_time_hours} hours</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">maximun seconds used in sample collection</td>
                        <td className="text-capitalize">{max_time_seconds}</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">minimun Hours used in sample collection</td>
                        <td className="text-capitalize">{min_time_hours} hours</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">minimun minutes used in sample collection</td>
                        <td className="text-capitalize">{min_time_minutes}</td>
                    </tr>
                    <tr>
                        <td className="text-capitalize">minimun seconds used in sample collection</td>
                        <td className="text-capitalize">{min_time_seconds}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}