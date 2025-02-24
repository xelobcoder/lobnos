// app/report.tsx
'use client';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ReportData {
    resultsettings: {
        letterHeading: number;
        literatureReview: number;
        DepartmentEntry: number;
        passwordonResult: number;
        samplingInformation: number;
    };
    records: RecordItem[];
    companyInfo: {
        name: string;
        email: string;
        motto: string;
        phonenumber: number;
        address: string;
        website: string;
        street: string;
        alternativenumber: number;
    };
    patientInformation: {
        patientid: number;
        fullpatientid: string;
        designation: string;
        firstname: string;
        email: string;
        dob: string;
        age: number;
        gender: string;
        marital_status: string;
        mobile_number: string;
        agetype: string;
        occupation: string;
        date: string;
        activation_status: string;
        lastname: string;
        middlename: string;
        organization: string;
        contactpointer: string;
        whatAppcontact: string;
    };
    comments: string;
    testname: string;
    validators: {
        username: string;
        employeeid: number;
        role: string;
    }[];
    hasDrugs: boolean;
    patientid: number;
    billingid: number;
    lastupdatedon: string;
    logourl: string;
    enteredOn: string;
    resultentry: string;
    literatureReview: null;
}

interface RecordItem {
    name: string;
    value: string;
    options: string;
    testid: string;
    hasunits: boolean;
    units: string;
    plan: string;
    fieldConstraints: {
        alert: string;
        constraint: string;
        replacementText: string;
        valueAlert: string;
        prefix: string;
        suffix: string;
    }[];
    ordering: string;
    textReference: string;
    upperlimit?: string;
    lowerlimit?: string;
}

// Directly use the JSON data from the file
const data: ReportData = {
    "resultsettings": {
        "letterHeading": 1,
        "literatureReview": 1,
        "DepartmentEntry": 1,
        "passwordonResult": 1,
        "samplingInformation": 1
    },
    "records": [
        {
            "name": "TIIFU HAMZA KOJO BORONSO N",
            "value": "YBrO20G2jwnZAH2d5n7MLeDamSE=",
            "options": "",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "input",
            "fieldConstraints": [
                {
                    "alert": "3",
                    "constraint": "1",
                    "replacementText": "400",
                    "valueAlert": "500",
                    "prefix": "MLS ",
                    "suffix": "USER"
                }
            ],
            "ordering": "",
            "textReference": ""
        },
        {
            "name": "TIIFU  HAMZA ",
            "value": "OvdIaT+A23Yk0x8CFcRvP25QU2A=",
            "options": "",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "textReference",
            "fieldConstraints": [
                {
                    "alert": "3",
                    "constraint": "4",
                    "replacementText": "HAMZA",
                    "valueAlert": "TIIFU ",
                    "prefix": "SUFFIX ",
                    "suffix": "MATCH"
                },
                {
                    "alert": "2",
                    "constraint": "1",
                    "replacementText": "",
                    "valueAlert": "55",
                    "prefix": "tIIFU",
                    "suffix": "Hamza"
                }
            ],
            "ordering": "0",
            "textReference": "TIIFU,\nKOJO,\nGENESIS"
        },
        {
            "name": "TIIFU",
            "value": "hSH/5rCUn0llIob/LDeuQf47yelc",
            "options": "tiifu,Hamza",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "options",
            "fieldConstraints": [
                {
                    "alert": "3",
                    "constraint": "3",
                    "replacementText": "NO MALARIA PARASITE SEEN",
                    "valueAlert": "0",
                    "prefix": "",
                    "suffix": ""
                }
            ],
            "ordering": "",
            "textReference": "",
            "upperlimit": "2"
        },
        {
            "name": "TIIFU HAMZA ATTITUDE",
            "value": "hBnTxfaEJF9f/H5mTFhVvMEZ5XJo",
            "options": "Sibling,Chronicle,Hamza,Genesis,Hamza os a king",
            "testid": "",
            "hasunits": true,
            "units": "mls",
            "plan": "options",
            "fieldConstraints": [],
            "ordering": "",
            "textReference": ""
        },
        {
            "name": "Tiifu Hamza ",
            "value": "mCek2Mq8kT02lFrFOM/rsnrbjsm4INk=",
            "options": "kdkwekk,Genesis,Barakah",
            "testid": "",
            "hasunits": true,
            "units": "mls",
            "plan": "options",
            "fieldConstraints": [],
            "ordering": "",
            "textReference": ""
        },
        {
            "name": "Tiifu",
            "value": "hSH/5rCUn0llIob/LDeuQf47yelc",
            "options": "T,I,F,U",
            "testid": "",
            "hasunits": false,
            "units": "",
            "plan": "options",
            "fieldConstraints": [
                {
                    "alert": "3",
                    "constraint": "4",
                    "replacementText": "No Malaria Parasite seen",
                    "valueAlert": "55",
                    "prefix": "",
                    "suffix": ""
                }
            ],
            "ordering": "",
            "textReference": ""
        },
        {
            "name": "Tiifu HAmza ",
            "value": "mCek2Mq8kT02lFrFOM/rsnrbjsm4INk=",
            "options": "tiifu,hheheh,time",
            "testid": "",
            "category": "",
            "undercategory": true,
            "hasunits": true,
            "units": "mg.dl",
            "plan": "options",
            "fieldConstraints": [
                {
                    "alert": "3",
                    "constraint": "1",
                    "replacementText": "tiifu",
                    "valueAlert": "777",
                    "prefix": "",
                    "suffix": ""
                },
                {
                    "alert": "3",
                    "constraint": 2,
                    "replacementText": "tiifu hamza ",
                    "valueAlert": "tiifu",
                    "prefix": "",
                    "suffix": ""
                }
            ],
            "ordering": "",
            "textReference": "",
            "categoryid": 9
        },
        {
            "name": "Eugene Edzor",
            "value": "",
            "options": "",
            "testid": "",
            "category": "",
            "undercategory": true,
            "hasunits": true,
            "units": "mls",
            "plan": "plain",
            "fieldConstraints": [],
            "ordering": "",
            "textReference": "Male: 770-388;\nFemale:3993-38399;\nChildren:883-8399;\nGeneral: 500-93993;",
            "categoryid": 12,
            "children": {
                "lowerlimit": 883,
                "upperlimit": 8399
            },
            "general": {
                "lowerlimit": 500,
                "upperlimit": 93993
            }
        },
        {
            "name": "HAMZA",
            "value": "wkjyfAu3Y94mc9EJRWAKMlpTq8jSf9Sy8odx",
            "options": "TIIFU,GENETICS,POSITIVE(+),POSITIVE(++),POSITIVE(+++),POSITIVE(++++)",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "options",
            "fieldConstraints": [
                {
                    "alert": 1,
                    "constraint": 2,
                    "replacementText": "",
                    "valueAlert": "",
                    "prefix": "",
                    "suffix": ""
                }
            ],
            "ordering": "1",
            "textReference": ""
        },
        {
            "name": "GENESIS",
            "value": "0pnAHRzzdS8h67wnbTN7O0NtVJA=",
            "options": "",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "plain",
            "ordering": "2",
            "general": {
                "lowerlimit": 383,
                "upperlimit": 7373
            },
            "children": {
                "lowerlimit": 8494,
                "upperlimit": 8484
            }
        },
        {
            "name": "MULTIPLE ",
            "value": "HgMFWXFID5blCKQiKC0vRiu6dGiBqUM=",
            "options": "",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "plain",
            "ordering": "3",
            "general": {
                "lowerlimit": 383,
                "upperlimit": 7373
            },
            "children": {
                "lowerlimit": 8494,
                "upperlimit": 8484
            }
        },
        {
            "name": "GENESIS MODULATION STRATEGY",
            "value": "xRe5nO9pVMtITU3ON4EFa/4yqhjv",
            "options": "",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "textReference",
            "fieldConstraints": [],
            "ordering": "4",
            "textReference": "kfjkefkj,\nkefkerk,\njkerkerk\nkrkejk"
        },
        {
            "name": "TIIFU HAMZA KOJO BORONSON",
            "value": "YBdM3auXfEbQhDM23GKPUvF0xewFiA==",
            "options": "",
            "testid": "",
            "hasunits": true,
            "units": "MLS",
            "plan": "limits",
            "fieldConstraints": [
                {
                    "alert": "3",
                    "constraint": "3",
                    "replacementText": "NO PARASITE SEEN",
                    "valueAlert": "0",
                    "prefix": "",
                    "suffix": ""
                }
            ],
            "ordering": "5",
            "upperlimit": "300",
            "lowerlimit": "200"
        }
    ],
    "companyInfo": {
        "name": "VITALSCAN  DIAGNOSTIC AND LABORATORY",
        "email": "vitalscandiagnostic@gmail.com",
        "motto": "Your Health is Vital to Us",
        "phonenumber": 373119220,
        "address": "Opposite West Hospital Main Along the Picorna Road",
        "website": "vitalscan@health.com",
        "street": "Picorna Road",
        "alternativenumber": 733737377
    },
    "patientInformation": {
        "patientid": 1,
        "fullpatientid": "NR-000001-TAM",
        "designation": "Mr.",
        "firstname": "Tiifu",
        "email": "hamzatiifu56@gmail.com",
        "dob": "1990-11-29T23:00:00.000Z",
        "age": 34,
        "gender": "male",
        "marital_status": "single",
        "mobile_number": "596737737",
        "agetype": "years",
        "occupation": "Nursinf ",
        "date": "2024-08-27T23:00:00.000Z",
        "activation_status": "TRUE",
        "lastname": "Hamza",
        "middlename": "shefik",
        "organization": "Leonides",
        "contactpointer": "self",
        "whatAppcontact": "0666666666"
    },
    "comments": "<p>fk3hjgwejhfwjhfwghfhwefh</p>",
    "testname": "Thyroid function test ",
    "validators": [
        {
            "username": "TIIFU HAMZA ",
            "employeeid": 3,
            "role": "admin"
        },
        {
            "username": "DR. KARIM YUSSIF WEIBADUA",
            "employeeid": 45,
            "role": "admin"
        }
    ],
    "hasDrugs": false,
    "patientid": 1,
    "billingid": 23,
    "lastupdatedon": "2025-02-08T15:25:18.825Z",
    "logourl": "http://localhost:5000/api/v1/settings/companyprofile/images",
    "enteredOn": "2025-02-13T10:56:43.142Z",
    "resultentry": "DR. KARIM YUSSIF WEIBADUA",
    "literatureReview": null
}

export default function MedicalReport() {
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getReferenceRange = (record: RecordItem): string => {
        if (record.fieldConstraints && record.fieldConstraints.length > 0) {
            const constraint = record.fieldConstraints[0];
            return `${constraint.prefix || ''} ${constraint.replacementText || ''} - ${constraint.valueAlert || ''} ${constraint.suffix || ''}`.trim();
        } else if (record.lowerlimit || record.upperlimit) {
            return `${record.lowerlimit || ''} - ${record.upperlimit || ''}`.trim();
        }
        return 'N/A';
    };

    const getFlag = (record: RecordItem): string => {
        if (record.fieldConstraints && record.fieldConstraints.some(constraint => constraint.alert === '3')) {
            return 'High';
        }
        return 'Normal';
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h4>{data.companyInfo.name}</h4>
                    <p>{data.companyInfo.address}</p>
                    <p>Email: {data.companyInfo.email} | Contact: {data.companyInfo.phonenumber} | Alt: {data.companyInfo.alternativenumber}</p>
                </div>
                <div className="card-body">
                    <h5 className="card-title">Patient Information</h5>
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Name:</strong> {data.patientInformation.firstname} {data.patientInformation.middlename} {data.patientInformation.lastname}</p>
                            <p><strong>Age:</strong> {data.patientInformation.age} years</p>
                            <p><strong>Gender:</strong> {data.patientInformation.gender}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Patient ID:</strong> {data.patientInformation.fullpatientid}</p>
                            <p><strong>Billing ID:</strong> {data.billingid}</p>
                            <p><strong>Report Date:</strong> {formatDate(data.enteredOn)}</p>
                        </div>
                    </div>

                    <h5 className="card-title mt-3">Test Results - {data.testname}</h5>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Result</th>
                                <th>Units</th>
                                <th>Reference Range</th>
                                <th>Flag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.records.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.name}</td>
                                    <td>{record.value}</td>
                                    <td>{record.units}</td>
                                    <td>{getReferenceRange(record)}</td>
                                    <td>{getFlag(record)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h5 className="card-title mt-3">Comments</h5>
                    <p dangerouslySetInnerHTML={{ __html: data.comments }}></p>

                    <h5 className="card-title mt-3">Validators</h5>
                    <ul>
                        {data.validators.map((validator, index) => (
                            <li key={index}>{validator.username} ({validator.role})</li>
                        ))}
                    </ul>

                    <p className="text-muted">Last Updated On: {formatDate(data.lastupdatedon)}</p>
                    <div className="text-center mt-4">
                        <p><em>{data.companyInfo.motto}</em></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
