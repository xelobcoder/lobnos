import { FC, useEffect, useState } from 'react';
import { customFetch, customPost } from '../../Auth/customFetch';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import PrimeToast from '../../accessories/PrimeToast';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { RiEditLine, RiDeleteBinLine, RiSaveLine, RiCloseLine, RiAddLine, RiListCheck } from '@remixicon/react';
import { Tab, Nav } from 'react-bootstrap';


interface SampleContainer {
  name: string;
  description: string;
  volume_capacity: number;
  material: string;
  color: string;
  is_reusable: boolean;
}


interface SavedContainer extends SampleContainer {
  id: number;
  created_at: string;
  updated_at: string;
}

const SampleContainerForm: FC = () => {
  const colorOptions = [
    { value: 'Red', hex: '#FF0000' },
    { value: 'Blue', hex: '#0000FF' },
    { value: 'Green', hex: '#008000' },
    { value: 'Yellow', hex: '#FFFF00' },
    { value: 'Purple', hex: '#800080' },
    { value: 'Orange', hex: '#FFA500' },
    { value: 'Pink', hex: '#FFC0CB' },
    { value: 'Brown', hex: '#A52A2A' },
    { value: 'Black', hex: '#000000' },
    { value: 'White', hex: '#FFFFFF' },
    { value: 'Gray', hex: '#808080' },
    { value: 'Amber', hex: '#FFBF00' },
    { value: 'Clear', hex: '#F8F8FF' }
  ];
  const [savedContainers, setSavedContainers] = useState<SavedContainer[]>([]);
  const [isEditing, setIsEditing] = useState<{ isEditing: boolean, containerid: number | null }>({ isEditing: false, containerid: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    const fetchContainers = async () => {
      setIsLoading(true);
      try {
        const response = await customFetch('sample/containers');
        if (response && Array.isArray(response)) {
          setSavedContainers(response);
        }
      } catch (error) {
        toast.error('Failed to load containers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContainers();
  }, []);



  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SampleContainer>({
    defaultValues: {
      name: '',
      description: '',
      volume_capacity: 0,
      material: '',
      color: '',
      is_reusable: false
    }
  });

  const watchedColor = watch('color');

  useEffect(() => {
    setSelectedColor(watchedColor);
  }, [watchedColor]);

  const onSubmit: SubmitHandler<SampleContainer> = async (data) => {
    setIsSubmitting(true);
    try {
      const method = isEditing.isEditing ? 'PUT' : 'POST';
      const url = isEditing.isEditing
        ? `sample/containers/${isEditing.containerid}`
        : 'sample/containers';

      const response = await customPost(url, method, data);

      if (response.status === true) {
        const successMessage = isEditing.isEditing
          ? 'Container updated successfully'
          : 'Container created successfully';

        toast.success(successMessage);

        setIsLoading(true);
        const updatedContainers = await customFetch('sample/containers');
        if (updatedContainers && Array.isArray(updatedContainers)) {
          setSavedContainers(updatedContainers);
        }
        setIsLoading(false);

        setIsEditing({ isEditing: false, containerid: null });
        reset({
          name: '',
          description: '',
          volume_capacity: 0,
          material: '',
          color: '',
          is_reusable: false
        });
      } else {
        const errorMessage = isEditing.isEditing
          ? 'Failed to update container'
          : 'Failed to create container';
        toast.error(response.message || errorMessage);
      }
    } catch (error) {
      const errorMessage = isEditing.isEditing
        ? 'Error updating container'
        : 'Error creating container';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await customPost(`sample/containers/${id}`, 'DELETE', {});
      if (response.status === true) {
        setSavedContainers(prev => prev.filter(container => container.id !== id));
        toast.success('Container deleted successfully');
      } else {
        toast.error('Failed to delete container');
      }
    } catch (error) {
      toast.error('Error deleting container');
    }
  };

  const handleEdit = async (data: SavedContainer) => {
    try {
      const response = await customFetch(`sample/containers/${data.id}`);
      reset(response);
      setIsEditing({ isEditing: true, containerid: data.id });
    } catch (error) {
      toast.error('Error updating container');
    }
  };

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Material',
      accessor: 'material',
    },
    {
      Header: 'Volume Capacity',
      accessor: 'volume_capacity',
      Cell: ({ value }: {value: SavedContainer["volume_capacity"]}) => `${value} ml`,
    },
    {
      Header: 'Color',
      accessor: 'color',
    },
    {
      Header: 'Reusable',
      accessor: 'is_reusable',
      Cell: ({ value }: {value: SavedContainer["is_reusable"]}) => (value ? 'Yes' : 'No'),
    },
    {
      Header: 'Actions',
      accessor: 'id',
      Cell: ({ row }: {row: {original: SavedContainer; index: number}}) => (
        <div className="flex gap-2">
          <button
            className="edit-btn btn-outline btn-sm btn btn-primary"
            onClick={() => handleEdit(row.original)}
          >
            <RiEditLine className="mr-1" /> Edit
          </button>
          <button
            className="btn btn-outline btn-sm btn-danger mx-1"
            onClick={() => handleDelete(row.original.id)}
          >
            <RiDeleteBinLine className="mr-1" /> Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid">
      <Tab.Container defaultActiveKey="form">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="form">
              <RiAddLine className="me-2" />
              {isEditing.isEditing ? 'Edit' : 'Add'} Sample Container
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="list">
              <RiListCheck className="me-2" />
              Container List
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="form">
            <div className="mx-2 d-flex justify-content-between">
              <h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5">
                {isEditing.isEditing ? 'Edit Sample Container' : 'Add Sample Container'}
              </h5>
            </div>

            <div className="border bg-white border-secondary-subtle mx-2 p-2">
              <form className="mx-4">
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Container Name*</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g., Glass Jar 500ml"
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Volume Capacity (ml)*</label>
                      <input
                        {...register('volume_capacity', {
                          required: 'Volume capacity is required',
                          min: { value: 0, message: 'Volume must be positive' }
                        })}
                        type="number"
                        className={`form-control ${errors.volume_capacity ? 'is-invalid' : ''}`}
                        step="0.01"
                      />
                      {errors.volume_capacity && <div className="invalid-feedback">{errors.volume_capacity.message}</div>}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Material*</label>
                      <input
                        {...register('material', { required: 'Material is required' })}
                        type="text"
                        className={`form-control ${errors.material ? 'is-invalid' : ''}`}
                        placeholder="e.g., Glass, Plastic"
                      />
                      {errors.material && <div className="invalid-feedback">{errors.material.message}</div>}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Color</label>
                      <Controller
                        name="color"
                        control={control}
                        render={({ field }) => (
                          <>
                            <select
                              {...field}
                              className="form-select mb-2"
                            >
                              <option value="">Select a color</option>
                              {colorOptions.map((color) => (
                                <option key={color.value} value={color.value}>
                                  {color.value}
                                </option>
                              ))}
                            </select>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {colorOptions.map((color) => (
                                <div
                                  key={color.value}
                                  onClick={() => {
                                    setValue('color', color.value);
                                    setSelectedColor(color.value);
                                  }}
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: color.hex,
                                    cursor: 'pointer',
                                    border: '1px solid #ddd',
                                    boxShadow: field.value === color.value ? '0 0 0 3px rgba(13, 110, 253, 0.5)' : 'none',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title={color.value}
                                >
                                  {field.value === color.value && (
                                    <span style={{
                                      color: ['White', 'Yellow', 'Clear'].includes(color.value) ? '#000' : '#fff',
                                      fontSize: '16px',
                                      fontWeight: 'bold'
                                    }}>✓</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        {...register('description')}
                        className="form-control"
                        rows={3}
                        placeholder="Enter container description"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        {...register('is_reusable')}
                        type="checkbox"
                        className="form-check-input"
                        id="is_reusable"
                      />
                      <label className="form-check-label" htmlFor="is_reusable">
                        Is Reusable
                      </label>
                    </div>
                  </div>
                </div>

                <hr />

                <div>
                  <button
                    type="submit"
                    className="btn btn-success btn-sm mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : isEditing.isEditing ? 'Update Container' : 'Create Container'}
                  </button>
                  {isEditing.isEditing && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm ms-2 mt-2"
                      disabled={isSubmitting}
                      onClick={() => {
                        setIsEditing({ isEditing: false, containerid: null });
                        reset({
                          name: '',
                          description: '',
                          volume_capacity: 0,
                          material: '',
                          color: '',
                          is_reusable: false
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="list">
            <div className="mx-2 d-flex justify-content-between">
              <h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5">
                Sample Containers List
              </h5>
            </div>

            <div className="border bg-white border-secondary-subtle mx-2 p-2">
              <div className="mx-4">
                <PrimeTable
                  column={columns}
                  data={savedContainers}
                  filtering={false}
                  handleSeverSideProcessing={false}
                  serverSideFiltering={false}
                />
              </div>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      <PrimeToast />
    </div>
  );
};

export default SampleContainerForm;