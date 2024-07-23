// components/Clinicians/ClinicianList.jsx
import { useCallback, useEffect, useState } from "react";
import { customPost, getDataAndUpdateState, updatePagination } from "../../components/Auth/customFetch";
import TableDisplay from '../../components/accessories/TableDisplay';
import { IconButton, Typography } from "@mui/material";
import { DeleteForeverOutlined, Edit, Visibility } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import Pagination from '../../components/accessories/pagination';
import Loader from "../../components/accessories/Loader";
import { Button } from "react-bootstrap";

export default function ClinicianList() {
    const [ClinicianList, setClinician] = useState([]);
    const [editing, setEditing] = useState({ editing: false, editid: null });
    const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
    const [loading, setLoading] = useState(false);
    const [load, setLoad] = useState(false);
    const router = useRouter();

    const getClinicianData = useCallback(async () => {
        try {
            setLoading(true);
            await getDataAndUpdateState(setClinician, `clinicians?count=${pagination.count}&&page=${pagination.page}`);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            alert(err || 'error connecting to server');
        }
    }, [pagination.count, pagination.page]);

    useEffect(() => {
        getClinicianData();
    }, [getClinicianData]);

    const ForClientEdit = (originaldata) => {
        const { id } = originaldata;
        if (!id) return;
        setEditing({ editing: true, editid: parseInt(id) });
        router.push('/clinician/new'); // Redirect to form page
        window.scrollTo(0, 0);
    };

    const columns = [
        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: 'Email',
            accessor: 'email'
        },
        {
            Header: 'Location',
            accessor: 'location'
        },
        {
            Header: 'Commission rate',
            accessor: 'commission',
            Cell: ({ row }) => {
                const { original } = row;
                return <Typography variant="body2">{original?.commission}%</Typography>;
            }
        },
        {
            Header: 'Phone',
            accessor: 'phone'
        },
        {
            Header: 'Occupation',
            accessor: 'occupation'
        },
        {
            Header: 'Address',
            accessor: 'address'
        },
        {
            Header: 'Actions',
            accessor: '',
            Cell: ({ row }) => {
                const { original } = row;
                return (
                    <div>
                        <IconButton onClick={() => ForClientEdit(original)}>
                            <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => router.push(`/clinician/clinicianview?clinicianid=${original.id}`)}>
                            <Visibility sx={{ color: 'green' }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(original)}>
                            <DeleteForeverOutlined sx={{ color: 'red' }} />
                        </IconButton>
                    </div>
                );
            }
        }
    ];

    const handleDelete = async (original) => {
        let confirmation = confirm('Do you want to delete the clinician?');
        if (!confirmation) return;
        const { id } = original;
        if (!id) return;

        try {
            let deletepush = await customPost('clinicians', 'DELETE', { id });
            const { statusCode, status, message } = deletepush;
            if (statusCode === 200 && status === 'success') {
                toast.success(message, { position: 'top-right', autoClose: 1000 });
                setClinician((prev) => prev.filter((item) => item.id !== id));
            } else {
                toast.error(message, { position: 'top-right', autoClose: 1000 });
            }
        } catch (err) {
            toast.error(err.message || 'error connecting to server', { position: 'top-right', autoClose: 1000 });
        }
    };

    const reset = () => {
        setEditing({ editid: null, editing: false });
    };

    const updatePage = (value) => {
        updatePagination(value, setPagination, pagination);
    };

    const renderingView = () => {
        if (loading) return <Loader />;
        return (
            <div>
                <TableDisplay data={ClinicianList} exporters={false} showpage={false} column={columns} filtering={true} />
                <section className="d-flex justify-content-center">
                    <Pagination page={pagination.page} load={setLoad} updateFunction={updatePage} />
                </section>
            </div>
        );
    };

    return (
        <FrontDeskLayout>
            <ToastContainer />
            <div className="d-flex justify-content-between"> 
                <h4>Registered Clinician List</h4>
                <Button variant='primary'>
                    Add new Clinician
                </Button>
            </div>
            <div className="card-body">
                {renderingView()}
            </div>
        </FrontDeskLayout>
    );
}
