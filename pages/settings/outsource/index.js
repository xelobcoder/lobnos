import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch } from "../../../components/Auth/customFetch";
import TableDisplay from "../../../components/accessories/TableDisplay";
import { Dropdown} from "react-bootstrap";
import MoreVertIcon from '@mui/icons-material/MoreVert';


export default function IndexPageOutsource() {
    const [isLoading, setLoading] = useState(false);
    const [organization, setOrganization] = useState([])

    useEffect(() => {
        async function fetchOurSourcingOrganization() {
            const response = await customFetch(`outsourcing/organization/all`);
            if (Array.isArray(response)) {
                setOrganization(response);
            }
        }
        fetchOurSourcingOrganization()
    }, [])


    const columns = [
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Type',
            accessor: 'organizationType',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Address',
            accessor: 'address',
        },
        {
            Header: 'Billing Address',
            accessor: 'billingAddress',
        },
        {
            Header: 'Contact No.',
            accessor: 'contactNumber',
        },
        {
            Header: 'Contact Person',
            accessor: 'contactPerson',
        },
        {
            Header: 'Added on',
            accessor: 'addedon',
            Cell: ({ value }) => {
                return <div>{new Date(value).toLocaleString()}</div>
            }
        },
        {
            Header: 'Added By',
            accessor: 'createdby',
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div>
                    <Dropdown  >
                        <Dropdown.Toggle variant="light" id="archives-dropdown">
                            <MoreVertIcon />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="m-0 p-0 bg-white">
                            <Dropdown.Item className='text-capitalize' onClick={(ev) => {
                                callActivation(
                                    item.activation_status,
                                    item.patientid,
                                    toast,
                                );
                            }} >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z"></path></svg> Edit Information
                            </Dropdown.Item>
                            <Dropdown.Item className='text-capitalize' onClick={(ev) => {
                                callActivation(
                                    item.activation_status,
                                    item.patientid,
                                    toast,
                                );
                            }} >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z"></path></svg> Delete Information
                            </Dropdown.Item>
                            <Dropdown.Item className='text-capitalize' onClick={(ev) => {
                                callActivation(
                                    item.activation_status,
                                    item.patientid,
                                    toast,
                                );
                            }} >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z"></path></svg> Archive organization
                            </Dropdown.Item>

                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            ),
        },
    ];
    return (
        <MainSettingsLayoutView>
            <div>
                <input type="text" className="custom-input h-40" placeholder="Filter here" />
            </div>
            <TableDisplay column={columns} data={organization} filtering={false} showpage={false} exporters={false} />
        </MainSettingsLayoutView>
    )
}