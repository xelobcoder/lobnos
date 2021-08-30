import React from 'react'

export default function ThyroidSetup() {
    return (
        <div>
            <section>
                <form>
                    <table className="table">
                        <thead>
                            <th>#</th>
                            <th>parameter</th>
                            <th>unit</th>
                            <th>lower limit</th>
                            <th>upper limit</th>
                        </thead>
                        <tbody>
                            <tr>
                                    <td>1</td>
                                    <td>tsh</td>
                                    <td>
                                        <input type="text" className="form-control" id="unit"/>
                                    </td>
                                    <td>  <input type="number" className="form-control" id="lowerlimit"/></td>
                                    <td>
                                        <input type="number" className="form-control" id="upperlimit"/>
                                    </td>
                            </tr>
                            <tr>
                                    <td>2</td>
                                    <td>T4</td>
                                    <td>
                                        <input type="text" className="form-control" id="unit"/>
                                    </td>
                                    <td>  <input type="number" className="form-control" id="lowerlimit"/></td>
                                    <td>
                                        <input type="number" className="form-control" id="upperlimit"/>
                                    </td>
                            </tr>
                            <tr>
                                    <td>3</td>
                                    <td>T3</td>
                                    <td>
                                        <input type="text" className="form-control" id="unit"/>
                                    </td>
                                    <td>  <input type="number" className="form-control" id="lowerlimit"/></td>
                                    <td>
                                        <input type="number" className="form-control" id="upperlimit"/>
                                    </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </section>
        </div>
    )
}
