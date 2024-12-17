import { currencyFormatter, customPost, customFetch } from "../../components/Auth/customFetch";
import MainSettingsLayoutView from "../../components/settingsComponents/MainSettingsLayoutView";
import { useEffect, useState } from "react";
import { fetchServices } from "../../lib/billingLib";
import TableDisplay from "../../components/accessories/TableDisplay";
import { useApplicationSettings } from "../../components/Auth/useApplicationContext";

export default function AdditionalServicesPage() {
    const [servicesList, setServicesList] = useState([]);
    const { applicationsettings } = useApplicationSettings();
    const { employeeid } = applicationsettings.user;
    const [service, setService] = useState({
        name: "",
        price: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editServiceId, setEditServiceId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setService({
            ...service,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (service.name && parseFloat(service.price) >= 0) {
            if (isEditing) {
                const response = await customPost(`billing/services`, 'PUT', { ...service, employeeid, serviceid: editServiceId });
                if (response.status) {
                    setServicesList((prevList) =>
                        prevList.map((item) =>
                            item.keyid === editServiceId
                                ? { ...item, serviceName: service.name, servicePrice: service.price }
                                : item
                        )
                    );
                }
                setIsEditing(false);
                setEditServiceId(null);
            } else {
                const response = await customPost("billing/services", 'POST', { ...service, employeeid });
                fetchServices(setServicesList);
            }
        } else {
            console.log("Please provide valid service name and price.");
        }
    };

    const handleEdit = (service) => {
        setIsEditing(true);
        setEditServiceId(service.keyid);
        setService({
            name: service.serviceName,
            price: service.servicePrice
        });
    };

    const handleDelete = async (serviceId) => {
        const response = await customPost(`billing/services?serviceid=${serviceId}`, 'DELETE');
        if (response.status) {
            setServicesList((prevList) => prevList.filter((item) => item.keyid !== serviceId));
        }
    };

    const columns = [
        { Header: 'Name', accessor: 'serviceName' },
        {
            Header: 'Price',
            accessor: 'servicePrice',
            Cell: ({ value }) => <div>{currencyFormatter.format(value)}</div>
        },
        { Header: 'Created By', accessor: 'username' },
        {
            Header: 'Actions',
            accessor: '',
            Cell: (row) => (
                <div>
                    <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleEdit(row.row.original)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm mx-2"
                        onClick={() => handleDelete(row.row.original.keyid)}
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        fetchServices(setServicesList);
    }, []);

    console.log(servicesList)
    return (
        <MainSettingsLayoutView>
            <div className="p-2">
                <form onSubmit={handleSubmit} className="col-sm-12 col-md-6 col-lg-4">
                    <div className="grid-reg">
                        <label>Service Name</label>
                        <input
                            className="custom-input"
                            name="name"
                            value={service.name}
                            onChange={handleInputChange}
                            placeholder="Service name"
                            required
                        />
                    </div>

                    <div className="grid-reg mt-2">
                        <label>Price</label>
                        <input
                            className="custom-input"
                            name="price"
                            type="number"
                            value={service.price}
                            onChange={handleInputChange}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className=" mx-lg-5 mx-xl-5 mx-md-5 mx-sm-0">
                        <button type="submit" className="btn btn-sm btn-primary mt-3 mx-lg-3 mx-xl-3 mx-md-2 mx-sm-0">
                            {isEditing ? "Update Service" : "Add Service"}
                        </button>
                    </div>
                </form>
                <div style={{overflowX:'auto'}}>
                    {servicesList.length > 0 && <TableDisplay column={columns} data={servicesList} showpage={false} filtering={true} />}
                </div>
            </div>
        </MainSettingsLayoutView>
    );
}
