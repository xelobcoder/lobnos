"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { defaultCreationRule, parseTextToObject, updateFieldsRules } from "./data/testUtil";
import TestFieldsHeader from './TestFieldsHeader';
import { RiAddLine, RiSaveLine, RiCloseLine, RiEditLine, RiArrowLeftLine, RiRefreshLine } from '@remixicon/react';

export default function CreateTestFields({ testid, testname, testRules, fieldConstraintsCategorization, testdata, onRefresh }) {
	const router = useRouter();
	const [data, setData] = useState(testRules);
	const [reorder, setReorder] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [newField, setNewField] = useState(defaultCreationRule);
	const [showCustomUnit, setShowCustomUnit] = useState(false);
	const STANDARD_UNITS = [
		"mg/dL", "g/dL", "µg/dL", "ng/dL",
		"mg/L", "g/L", "µg/L", "ng/mL", "pg/mL",
		"mmol/L", "µmol/L", "nmol/L",
		"mEq/L",

		"U/L", "IU/L", "IU/mL", "mIU/mL",
		"µIU/mL", "ng/mL", "pg/mL",

		"×10⁹/L", "×10¹²/L",
		"cells/µL", "cells/mm³",
		"/µL", "/mm³",
		"%",

		"seconds", "sec",
		"INR",
		"g/L",
		"mg/dL",

		"mmHg",
		"kPa",
		"pH",
		"mEq/L",
		"mmol/L",
		"%",

		"µL",
		"mL",
		"L",
		"dL",

		"pg",
		"ng",
		"µg",
		"mg",
		"g",
		"kg",

		"µm",
		"mm",
		"cm",
		"m",

		"°C",
		"°F",

		"seconds",
		"minutes",
		"hours",
		"days",

		"mOsm/kg",
		"mOsm/L",

		"mmHg",
		"kPa",

		"mL/min",
		"L/min",
		"mL/hr",

		"titer",
		"ratio",

		"OD",
		"AU",

		"CFU/mL",
		"CFU/g",
		"log CFU/mL",

		"mg/24h",
		"mL/24h",
		"µg/24h",
		"mmol/24h",
		"g/24h",

		"index",
		"S/CO",
		"AU/mL",
		"RU/mL",

		"ng/dL",
		"µg/dL",
		"pmol/L",
		"nmol/L",
		"pg/mL",

		"ppm",
		"ppb",
		"mg/L",
		"µg/L",

		"HPF",
		"LPF",
		"cells/HPF",
		"cells/LPF",

		"beats/min",
		"breaths/min",
		"m²",
		"kg/m²",

		"N/A",
		"unitless"
	];


	const typeOptions = [
		{ value: 'options', label: 'Dropdown' },
		{ value: 'input', label: 'Text' },
		{ value: 'textReference', label: 'Reference' },
		{ value: 'limits', label: 'Range (M/F/Child/Neonate)' },
		{ value: 'fetalBiometry', label: 'Fetal Biometry (Hadlock)' },
		{ value: 'greaterLess', label: 'Compare' },
		{ value: 'greaterLessEqualTo', label: 'Compare (<=/>=)' },
		{ value: 'plain', label: 'Text Area' },
		{ value: 'time', label: 'Time' },
		{ value: 'ultrasoundFields', label: 'Ultrasound' },
		{ value: 'datetime', label: 'Date & Time' },
		{ value: 'date', label: 'Date' }
	];

	const getDemographicLimitValue = (field: any, key: string) => {
		return field?.[key] ?? '';
	};

	const hasDemographicLimits = (field: any) => {
		const keys = [
			'lowerLimitFemale',
			'upperLimitFemale',
			'lowerLimitMale',
			'upperLimitMale',
			'lowerLimitChildren',
			'upperLimitChildren',
			'lowerLimitNeonates',
			'upperLimitNeonates',
		];
		return keys.some((key) => {
			const value = field?.[key];
			return value !== null && value !== undefined && `${value}`.trim() !== '';
		});
	};

	const renderFieldPreview = (field: any) => {
		const { plan, units, lowerlimit, upperlimit, options, textReference } = field;
		switch (plan) {
			case 'input':
				return <input type="text" className="form-control form-control-sm" value={units ? `120 ${units}` : "120"} disabled style={{ width: '120px', fontSize: '0.75rem' }} />;
			case 'options':
				const opts = Array.isArray(options) ? options : (typeof options === 'string' ? options.split(',') : ['Normal', 'Abnormal']);
				return (
					<select className="form-select form-select-sm" disabled style={{ width: '120px', fontSize: '0.75rem' }}>
						{opts.map((opt: string, i: number) => <option key={i}>{opt.trim()}</option>)}
					</select>
				);
			case 'plain':
				return <textarea className="form-control form-control-sm" value="Sample text area content..." disabled style={{ width: '120px', height: '30px', fontSize: '0.75rem', resize: 'none' }}></textarea>;
			case 'limits':
				if (hasDemographicLimits(field)) {
					return (
						<div style={{ fontSize: '0.65rem', lineHeight: '1.2', minWidth: '140px' }}>
							<div><span className="fw-semibold">M:</span> {getDemographicLimitValue(field, 'lowerLimitMale') || '-'} - {getDemographicLimitValue(field, 'upperLimitMale') || '-'}</div>
							<div><span className="fw-semibold">F:</span> {getDemographicLimitValue(field, 'lowerLimitFemale') || '-'} - {getDemographicLimitValue(field, 'upperLimitFemale') || '-'}</div>
							<div><span className="fw-semibold">C:</span> {getDemographicLimitValue(field, 'lowerLimitChildren') || '-'} - {getDemographicLimitValue(field, 'upperLimitChildren') || '-'}</div>
							<div><span className="fw-semibold">N:</span> {getDemographicLimitValue(field, 'lowerLimitNeonates') || '-'} - {getDemographicLimitValue(field, 'upperLimitNeonates') || '-'}</div>
							{units && <div className="text-secondary mt-1">{units}</div>}
						</div>
					);
				}

				return (
					<div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
						<span className="fw-bold">{lowerlimit || '0'}</span>
						<span className="text-muted">-</span>
						<span className="fw-bold">{upperlimit || '100'}</span>
						{units && <span className="text-secondary ms-1">{units}</span>}
					</div>
				);
			case 'greaterLess':
			case 'greaterLessEqualTo':
				return <input type="text" className="form-control form-control-sm" value={`${textReference || '> 50'} ${units || ''}`} disabled style={{ width: '120px', fontSize: '0.75rem' }} />;
			case 'textReference':
				return (
					<div className="p-1 border rounded bg-light shadow-sm" style={{ width: '140px', fontSize: '0.65rem', minHeight: '45px' }}>
						<div className="text-muted fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>REFERENCE RANGE</div>
						<div className="text-dark" style={{ whiteSpace: 'pre-line', lineHeight: '1.3' }}>
							{textReference ? textReference.split(';').map(s => s.trim()).filter(Boolean).join('\n') : "Male: 477-888\nFemale: >83393"}
						</div>
					</div>
				);
			case 'ultrasoundFields':
				return <input type="text" className="form-control form-control-sm" placeholder="Measurement" disabled style={{ width: '120px', fontSize: '0.75rem' }} />;
			case 'fetalBiometry':
				return (
					<div className="d-flex flex-column" style={{ fontSize: '0.65rem', minWidth: '120px' }}>
						<span className="fw-semibold">BPD, FL, HC, AC</span>
						<span className="text-muted">Hadlock EFW</span>
					</div>
				);
			default:
				return <span className="text-muted">-</span>;
		}
	};

	const renderConfigInput = (fieldState, setFieldState) => {
		switch (fieldState.plan) {
			case 'limits':
				return (
					<div className="d-flex flex-column gap-1" style={{ minWidth: '260px' }}>
						<div className="d-flex gap-1 align-items-center">
							<span style={{ width: '50px', fontSize: '0.75rem' }}>Male</span>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.lowerLimitMale ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, lowerLimitMale: e.target.value })}
								placeholder="Min"
								style={{ width: '85px' }}
							/>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.upperLimitMale ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, upperLimitMale: e.target.value })}
								placeholder="Max"
								style={{ width: '85px' }}
							/>
						</div>
						<div className="d-flex gap-1 align-items-center">
							<span style={{ width: '50px', fontSize: '0.75rem' }}>Female</span>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.lowerLimitFemale ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, lowerLimitFemale: e.target.value })}
								placeholder="Min"
								style={{ width: '85px' }}
							/>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.upperLimitFemale ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, upperLimitFemale: e.target.value })}
								placeholder="Max"
								style={{ width: '85px' }}
							/>
						</div>
						<div className="d-flex gap-1 align-items-center">
							<span style={{ width: '50px', fontSize: '0.75rem' }}>Children</span>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.lowerLimitChildren ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, lowerLimitChildren: e.target.value })}
								placeholder="Min"
								style={{ width: '85px' }}
							/>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.upperLimitChildren ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, upperLimitChildren: e.target.value })}
								placeholder="Max"
								style={{ width: '85px' }}
							/>
						</div>
						<div className="d-flex gap-1 align-items-center">
							<span style={{ width: '50px', fontSize: '0.75rem' }}>Neonate</span>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.lowerLimitNeonates ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, lowerLimitNeonates: e.target.value })}
								placeholder="Min"
								style={{ width: '85px' }}
							/>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.upperLimitNeonates ?? ''}
								onChange={(e) => setFieldState({ ...fieldState, upperLimitNeonates: e.target.value })}
								placeholder="Max"
								style={{ width: '85px' }}
							/>
						</div>
						<div className="d-flex gap-1 align-items-center mt-1">
							<span style={{ width: '50px', fontSize: '0.7rem' }} className="text-muted">Legacy</span>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.lowerlimit || ''}
								onChange={(e) => setFieldState({ ...fieldState, lowerlimit: e.target.value })}
								placeholder="Min"
								style={{ width: '85px' }}
							/>
							<input
								type="number"
								className="form-control form-control-sm"
								value={fieldState.upperlimit || ''}
								onChange={(e) => setFieldState({ ...fieldState, upperlimit: e.target.value })}
								placeholder="Max"
								style={{ width: '85px' }}
							/>
						</div>
					</div>
				);
			case 'options':
				return (
					<input
						type="text"
						className="form-control form-control-sm"
						value={Array.isArray(fieldState.options) ? fieldState.options.join(', ') : fieldState.options || ''}
						onChange={(e) => setFieldState({ ...fieldState, options: e.target.value })}
						onBlur={(e) => setFieldState({ ...fieldState, options: e.target.value.split(',').map(s => s.trim()) })}
						placeholder="Opt1, Opt2..."
					/>
				);
			case 'textReference':
				return (
					<textarea
						className="form-control form-control-sm"
						value={fieldState.textReference || ''}
						onChange={(e) => setFieldState({ ...fieldState, textReference: e.target.value })}
						placeholder="e.g. Male: 10-20; Female: 5-15"
						rows={2}
						style={{ fontSize: '0.8rem' }}
					/>
				);

			case 'greaterLess':
			case 'greaterLessEqualTo':
				return (
					<input
						type="text"
						className="form-control form-control-sm"
						value={fieldState.textReference || ''}
						onChange={(e) => setFieldState({ ...fieldState, textReference: e.target.value })}
						placeholder="e.g. > 10"
					/>
				);
			case 'fetalBiometry':
				return <span className="text-muted">Uses BPD, FL, HC, AC with Hadlock EFW in result entry</span>;
			default:
				return <span className="text-muted">-</span>;
		}
	};

	useEffect(() => {
		setData(testRules);
	}, [testRules]);

	const handleUpdateFields = async () => {
		if (data.length === 0) {
			toast.info("No fields to update.");
			return;
		}
		setIsLoading(true);
		try {
			await updateFieldsRules(data, toast, testid);
			toast.success("Fields updated successfully!");
		} catch (error) {
			toast.error("Failed to update fields. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const removeField = (itemToRemove) => {
		setData(prevData => prevData.filter(item => item.name !== itemToRemove.name));
	};

	const changeOrdering = (item, ev) => {
		const { value } = ev.target;
		const { name } = item;
		const updatedData = data.map(d => (d.name === name ? { ...d, ordering: value } : d));
		setData(updatedData);
	};

	const startEditing = (index: number) => {
		setEditingIndex(index);
		const field = data[index];
		// Normalize property names - convert lowerLimit/upperLimit to lowerlimit/upperlimit
		const normalizedField = {
			...field,
			lowerlimit: field.lowerlimit || field.lowerLimit || '',
			upperlimit: field.upperlimit || field.upperLimit || '',
			lowerLimitFemale: field.lowerLimitFemale ?? '',
			upperLimitFemale: field.upperLimitFemale ?? '',
			lowerLimitMale: field.lowerLimitMale ?? '',
			upperLimitMale: field.upperLimitMale ?? '',
			lowerLimitChildren: field.lowerLimitChildren ?? '',
			upperLimitChildren: field.upperLimitChildren ?? '',
			lowerLimitNeonates: field.lowerLimitNeonates ?? '',
			upperLimitNeonates: field.upperLimitNeonates ?? ''
		};
		setNewField(normalizedField);
		// If the existing unit is not in standard list, show custom input
		setShowCustomUnit(field.units && !STANDARD_UNITS.includes(field.units));
	};

	const cancelEditing = () => {
		setEditingIndex(null);
		setNewField(defaultCreationRule);
		setShowCustomUnit(false);
	};

	const saveField = () => {
		if (!newField.name?.trim()) {
			toast.error("Field name is required");
			return;
		}
		if (!newField.plan) {
			toast.error("Please select a field type");
			return;
		}

		let fieldToSave = { ...newField };

		// Ensure we don't save "Other" as the actual unit text
		if (showCustomUnit && fieldToSave.units === 'Other') {
			fieldToSave.units = '';
		}

		// Ensure options is a string for consistency
		if (Array.isArray(fieldToSave.options)) {
			fieldToSave.options = fieldToSave.options.join(', ');
		}

		if (fieldToSave.plan === 'limits') {
			fieldToSave = {
				...fieldToSave,
				lowerLimitFemale: fieldToSave.lowerLimitFemale ?? null,
				upperLimitFemale: fieldToSave.upperLimitFemale ?? null,
				lowerLimitMale: fieldToSave.lowerLimitMale ?? null,
				upperLimitMale: fieldToSave.upperLimitMale ?? null,
				lowerLimitChildren: fieldToSave.lowerLimitChildren ?? null,
				upperLimitChildren: fieldToSave.upperLimitChildren ?? null,
				lowerLimitNeonates: fieldToSave.lowerLimitNeonates ?? null,
				upperLimitNeonates: fieldToSave.upperLimitNeonates ?? null,
			};
		}

		if (fieldToSave.plan === "plain") {
			const formattedPlainToObject = parseTextToObject(newField.plain);
			fieldToSave = { ...fieldToSave, ...formattedPlainToObject };
		}

		if (editingIndex !== null) {
			// Update existing field
			const updatedData = [...data];
			updatedData[editingIndex] = fieldToSave;
			setData(updatedData);
			toast.success("Field updated successfully!");
		} else {
			// Add new field
			setData([...data, fieldToSave]);
		}

		setEditingIndex(null);
		setNewField(defaultCreationRule);
		setShowCustomUnit(false);
	};

	const addNewRow = () => {
		setEditingIndex(null);
		setNewField(defaultCreationRule);
		setShowCustomUnit(false);
		setTimeout(() => {
			const table = document.querySelector('.field-creation-table');
			if (table) {
				table.scrollIntoView({ behavior: 'smooth', block: 'end' });
			}
		}, 100);
	};

	return (
		<div className="container-fluid p-3">
			<div className="d-flex align-items-center gap-2 mb-3">
				<div className="d-flex align-items-center gap-2">
					<Button variant="outline-secondary" size="sm" onClick={() => router.back()}>
						<RiArrowLeftLine size={16} className="me-1" />
						Back to Test Panels
					</Button>
					{onRefresh && (
						<Button variant="outline-secondary" size="sm" onClick={onRefresh}>
							<RiRefreshLine size={16} className="me-1" />
							Refresh Data
						</Button>
					)}
				</div>
				<div style={{ width: '70%' }}>
					<TestFieldsHeader testid={testid} testname={testname} />
				</div>
			</div>
			<div className="row g-3 mt-2">
				<div className="col-12 d-flex flex-column">
					<div className="card shadow-sm h-100">
						<div className="card-body d-flex flex-column">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h2 className="card-title fs-5 fw-bold text-dark">Field Configuration ({data.length})</h2>
								<Button variant="primary" size="sm" onClick={addNewRow}>
									<RiAddLine size={16} className="me-1" />
									Add Field
								</Button>
							</div>

							<div className="flex-grow-1" style={{ minHeight: '50vh' }}>
								{/* Inline Field Creation Table */}
								<div className="table-responsive">
									<table className="table table-hover table-striped field-creation-table">
										<thead className="">
											<tr>
												<th style={{ width: '18%' }}>Field Name</th>
												<th style={{ width: '12%' }}>Plan</th>
												<th style={{ width: '10%' }}>Units</th>
												<th style={{ width: '15%' }}>Specific Config</th>
												<th style={{ width: '12%' }}>Preview</th>
												<th style={{ width: '10%' }}>Category</th>
												<th style={{ width: '8%' }}>Req?</th>
												<th style={{ width: '8%' }}>Order</th>
												<th style={{ width: '15%' }}>Actions</th>
											</tr>
										</thead>
										<tbody>
											{/* Existing Fields */}
											{Array.isArray(data) && data.length > 0 && data.map((field, index) => (
												<tr key={field.name || index}>
													<td>
														{editingIndex === index ? (
															<input
																type="text"
																className="form-control form-control-sm"
																value={newField.name || ''}
																onChange={(e) => setNewField({ ...newField, name: e.target.value })}
																placeholder="Field name"
																autoFocus
															/>
														) : (
															<strong>{field.name}</strong>
														)}
													</td>
													<td>
														{editingIndex === index ? (
															<select
																className="form-select form-select-sm"
																value={newField.plan || ''}
																onChange={(e) => setNewField({ ...newField, plan: e.target.value })}
															>
																<option value="">-- Select Type --</option>
																{typeOptions.map(type => (
																	<option key={type.value} value={type.value}>{type.label}</option>
																))}
															</select>
														) : (
															<span className="text-muted">{field.plan || '-'}</span>
														)}
													</td>
													<td>
														{editingIndex === index ? (
															showCustomUnit ? (
																<div className="d-flex gap-1">
																	<input
																		type="text"
																		className="form-control form-control-sm"
																		value={newField.units === 'Other' ? '' : newField.units || ''}
																		onChange={(e) => setNewField({ ...newField, units: e.target.value, hasunits: e.target.value.length > 0 })}
																		placeholder="Enter unit"
																		autoFocus
																	/>
																	<Button size="sm" variant="outline-secondary" onClick={() => setShowCustomUnit(false)}>
																		<RiCloseLine size={14} />
																	</Button>
																</div>
															) : (
																<select
																	className="form-select form-select-sm"
																	value={STANDARD_UNITS.includes(newField.units) || newField.units === 'Order' ? newField.units : (newField.units ? 'Other' : '')}
																	onChange={(e) => {
																		if (e.target.value === 'Other') {
																			setShowCustomUnit(true);
																		} else {
																			setNewField({ ...newField, units: e.target.value, hasunits: e.target.value.length > 0 });
																		}
																	}}
																>
																	<option value="">-- Unit --</option>
																	{STANDARD_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
																	<option value="Other">Other...</option>
																	<option value="Order">Order</option>
																</select>
															)
														) : (
															field.units || '-'
														)}
													</td>
													<td>
														{editingIndex === index ? (
															renderConfigInput(newField, setNewField)
														) : (
															<div style={{ fontSize: '0.8rem' }}>
																{field.plan === 'limits' && hasDemographicLimits(field) ? `M:${field.lowerLimitMale || '-'}-${field.upperLimitMale || '-'} F:${field.lowerLimitFemale || '-'}-${field.upperLimitFemale || '-'} C:${field.lowerLimitChildren || '-'}-${field.upperLimitChildren || '-'} N:${field.lowerLimitNeonates || '-'}-${field.upperLimitNeonates || '-'}` :
																	field.plan === 'limits' && ((field.lowerlimit || field.lowerLimit) || (field.upperlimit || field.upperLimit)) ? `${field.lowerlimit || field.lowerLimit || 0} - ${field.upperlimit || field.upperLimit || 0}` :
																		field.plan === 'fetalBiometry' ? 'BPD, FL, HC, AC (Hadlock)' :
																			field.plan === 'options' ? (Array.isArray(field.options) ? field.options.join(', ') : field.options || '-') :
																				field.plan === 'textReference' ? (field.textReference || '-') :
																					(field.plan === 'greaterLess' || field.plan === 'greaterLessEqualTo' || field.plan === 'time') ? (field.textReference || '-') : '-'}

															</div>
														)}
													</td>
													<td>
														{editingIndex === index ? (
															newField.plan ? renderFieldPreview(newField) : '-'
														) : (
															field.plan ? renderFieldPreview(field) : '-'
														)}
													</td>
													<td>
														{editingIndex === index ? (
															<select
																className="form-select form-select-sm"
																value={newField.categoryid || ''}
																onChange={(e) => setNewField({ ...newField, categoryid: e.target.value, category: e.target.value })}
															>
																<option value="">-- Select --</option>
																{fieldConstraintsCategorization?.map(cat => (
																	<option key={cat.categoryid} value={cat.categoryid}>
																		{cat.categoryname}
																	</option>
																))}
															</select>
														) : (
															fieldConstraintsCategorization?.find(c => c.categoryid === field.categoryid)?.categoryname || '-'
														)}
													</td>
													<td>
														{editingIndex === index ? (
															<input
																type="checkbox"
																className="form-check-input"
																checked={!!newField.isRequired}
																onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
															/>
														) : (
															field.isRequired ? <span className="text-success">✓</span> : <span className="text-muted">-</span>
														)}
													</td>
													<td>
														<input
															type="number"
															className="form-control form-control-sm"
															value={field.ordering || ''}
															onChange={(e) => changeOrdering(field, e)}
															placeholder="0"
															style={{ width: '60px' }}
														/>
													</td>
													<td>
														{editingIndex === index ? (
															<div className="d-flex gap-1">
																<Button size="sm" variant="success" onClick={saveField}>
																	<RiSaveLine size={14} />
																</Button>
																<Button size="sm" variant="outline-secondary" onClick={cancelEditing}>
																	<RiCloseLine size={14} />
																</Button>
															</div>
														) : (
															<div className="d-flex gap-1">
																<Button size="sm" variant="outline-primary" onClick={() => startEditing(index)}>
																	<RiEditLine size={14} />
																</Button>
																<Button size="sm" variant="outline-danger" onClick={() => removeField(field)}>
																	<RiCloseLine size={14} />
																</Button>
															</div>
														)}
													</td>
												</tr>
											))}

											{/* New Field Row */}
											{editingIndex === null && (
												<tr className="table-warning">
													<td>
														<input
															type="text"
															className="form-control form-control-sm"
															value={newField.name || ''}
															onChange={(e) => setNewField({ ...newField, name: e.target.value })}
															placeholder="Enter field name"
															autoFocus
														/>
													</td>
													<td>
														<select
															className="form-select form-select-sm"
															value={newField.plan || ''}
															onChange={(e) => setNewField({ ...newField, plan: e.target.value })}
														>
															<option value="">-- Select Type --</option>
															{typeOptions.map(type => (
																<option key={type.value} value={type.value}>{type.label}</option>
															))}
														</select>
													</td>
													<td>
														{showCustomUnit ? (
															<div className="d-flex gap-1">
																<input
																	type="text"
																	className="form-control form-control-sm"
																	value={newField.units === 'Other' ? '' : newField.units || ''}
																	onChange={(e) => setNewField({ ...newField, units: e.target.value, hasunits: e.target.value.length > 0 })}
																	placeholder="Enter unit"
																	autoFocus
																/>
																<Button size="sm" variant="outline-secondary" onClick={() => setShowCustomUnit(false)}>
																	<RiCloseLine size={14} />
																</Button>
															</div>
														) : (
															<select
																className="form-select form-select-sm"
																value={STANDARD_UNITS.includes(newField.units) || newField.units === 'Order' ? newField.units : (newField.units ? 'Other' : '')}
																onChange={(e) => {
																	if (e.target.value === 'Other') {
																		setShowCustomUnit(true);
																	} else {
																		setNewField({ ...newField, units: e.target.value, hasunits: e.target.value.length > 0 });
																	}
																}}
															>
																<option value="">-- Unit --</option>
																{STANDARD_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
																<option value="Other">Other...</option>
																<option value="Order">Order</option>
															</select>
														)}
													</td>
													<td>
														{renderConfigInput(newField, setNewField)}
													</td>
													<td>
														{newField.plan ? renderFieldPreview(newField) : '-'}
													</td>
													<td>
														<select
															className="form-select form-select-sm"
															value={newField.categoryid || ''}
															onChange={(e) => setNewField({ ...newField, categoryid: e.target.value, category: e.target.value })}
														>
															<option value="">-- Select --</option>
															{fieldConstraintsCategorization?.map(cat => (
																<option key={cat.categoryid} value={cat.categoryid}>
																	{cat.categoryname}
																</option>
															))}
														</select>
													</td>
													<td>
														<input
															type="checkbox"
															className="form-check-input"
															checked={!!newField.isRequired}
															onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
														/>
													</td>
													<td>
														<input
															type="number"
															className="form-control form-control-sm"
															value={newField.ordering || ''}
															onChange={(e) => setNewField({ ...newField, ordering: e.target.value })}
															placeholder="0"
															style={{ width: '60px' }}
														/>
													</td>
													<td>
														<Button size="sm" variant="success" onClick={saveField} disabled={!newField.name?.trim() || !newField.plan}>
															<RiSaveLine size={14} className="me-1" />
															Add
														</Button>
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>

							</div>

							{data.length > 0 && (
								<div className="d-flex gap-2 mt-auto pt-3 border-top justify-content-end">
									<Button
										variant="success"
										size="sm"
										onClick={handleUpdateFields}
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
												Saving Changes...
											</>
										) : (
											"Save All Changes"
										)}
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}