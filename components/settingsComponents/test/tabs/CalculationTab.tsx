"use client";

import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../../Auth/customFetch';
import { useApplicationSettings } from '../../../Auth/useApplicationContext';
import styles from './CalculationTab.module.css';

type TestParameter = {
     id: number;
     name: string;
     units?: string;
};

type FormulaInput = {
     fieldId: number | string;
     token: string;
     unit?: string;
};

type FormulaCondition = {
     inputToken: string;
     operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
     value: number | string;
};

type FormulaRecord = {
     id: number;
     output_field_id: number;
     expression: string;
     input_parameters: FormulaInput[] | string;
     unit: string | null;
     decimal_precision: number;
     conditions: FormulaCondition[] | string | null;
     version: number;
     effective_from: string;
     active: number | boolean;
};

const operators: { value: FormulaCondition['operator']; label: string }[] = [
     { value: 'eq', label: 'equals' },
     { value: 'neq', label: 'does not equal' },
     { value: 'gt', label: 'greater than' },
     { value: 'gte', label: 'at least' },
     { value: 'lt', label: 'less than' },
     { value: 'lte', label: 'at most' },
];

function parseJson<T>(value: T | string | null): T | null {
     if (value === null) return null;
     if (typeof value !== 'string') return value;
     try {
          return JSON.parse(value) as T;
     } catch {
          return null;
     }
}

function dateToday(): string {
     const date = new Date();
     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalculationTab({ testid, testname }: { testid: number; testname?: string }) {
     const employeeId = useApplicationSettings().applicationsettings?.user?.employeeid;
     const [parameters, setParameters] = useState<TestParameter[]>([]);
     const [formulas, setFormulas] = useState<FormulaRecord[]>([]);
     const [outputFieldId, setOutputFieldId] = useState('');
     const [expression, setExpression] = useState('');
     const [inputs, setInputs] = useState<FormulaInput[]>([{ fieldId: '', token: 'A', unit: '' }]);
     const [unit, setUnit] = useState('');
     const [precision, setPrecision] = useState(2);
     const [conditions, setConditions] = useState<FormulaCondition[]>([]);
     const [editingFormulaId, setEditingFormulaId] = useState<number | null>(null);
     const [loading, setLoading] = useState(true);
     const [saving, setSaving] = useState(false);

     const loadConfiguration = useCallback(async () => {
          setLoading(true);
          try {
               const [ruleResponse, formulaResponse] = await Promise.all([
                    customFetch(`testpanel/list/customtestrule?testid=${testid}`),
                    customFetch(`testpanel/calculations?testid=${testid}&employeeid=${employeeId || ''}`),
               ]);
               const rules = Array.isArray(ruleResponse) ? ruleResponse : ruleResponse?.data;
               const formulaList = Array.isArray(formulaResponse) ? formulaResponse : formulaResponse?.data;
               setParameters(Array.isArray(rules) ? rules.map((rule: any) => ({
                    id: Number(rule.id || rule.fieldid),
                    name: String(rule.name || rule.field || rule.id),
                    units: rule.units || '',
               })).filter((parameter: TestParameter) => Number.isInteger(parameter.id) && parameter.id > 0) : []);
               setFormulas(Array.isArray(formulaList) ? formulaList : []);
          } catch (error: any) {
               toast.error(error?.message || 'Could not load test calculation settings');
          } finally {
               setLoading(false);
          }
     }, [employeeId, testid]);

     useEffect(() => {
          void loadConfiguration();
     }, [loadConfiguration]);

     const updateInput = (index: number, patch: Partial<FormulaInput>) => {
          setInputs((current) => current.map((input, currentIndex) => currentIndex === index ? { ...input, ...patch } : input));
     };

     const addInput = () => {
          const token = String.fromCharCode(65 + inputs.length);
          setInputs((current) => [...current, { fieldId: '', token, unit: '' }]);
     };

     const resetFormulaForm = () => {
          setEditingFormulaId(null);
          setExpression('');
          setOutputFieldId('');
          setInputs([{ fieldId: '', token: 'A', unit: '' }]);
          setUnit('');
          setPrecision(2);
          setConditions([]);
     };

     const editFormula = (formula: FormulaRecord) => {
          setEditingFormulaId(formula.id);
          setOutputFieldId(String(formula.output_field_id));
          setExpression(formula.expression);
          setInputs((parseJson<FormulaInput[]>(formula.input_parameters) || []).map((input) => ({
               ...input,
               fieldId: String(input.fieldId),
          })));
          setUnit(formula.unit || '');
          setPrecision(Number(formula.decimal_precision ?? 2));
          setConditions((parseJson<FormulaCondition[]>(formula.conditions) || []).map((condition) => ({
               ...condition,
               value: String(condition.value),
          })));
          document.getElementById('calculation-formula-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
     };

     const saveFormula = async () => {
          const normalizedInputs = inputs.map((input) => ({
               fieldId: Number(input.fieldId),
               token: input.token.trim(),
               unit: input.unit?.trim() || undefined,
          }));
          if (!outputFieldId || !expression.trim() || normalizedInputs.some((input) => !input.fieldId || !input.token)) {
               toast.error('Choose an output, expression, and complete every input mapping.');
               return;
          }
          if (conditions.some((condition) => !condition.inputToken || condition.value === '' || !Number.isFinite(Number(condition.value)))) {
               toast.error('Complete every formula condition with an input, comparison, and numeric value.');
               return;
          }
          if (normalizedInputs.some((input) => input.fieldId === Number(outputFieldId))) {
               toast.error('The calculated output cannot also be one of its inputs.');
               return;
          }
          if (!employeeId) {
               toast.error('Your employee session could not be identified.');
               return;
          }

          setSaving(true);
          try {
               const response = await customFetchMutation('testpanel/calculations', 'PUT', {
                    testId: Number(testid),
                    outputFieldId: Number(outputFieldId),
                    expression: expression.trim(),
                    inputParameters: normalizedInputs,
                    unit: unit.trim() || undefined,
                    decimalPrecision: precision,
                    conditions: conditions.map((condition) => ({
                         ...condition,
                         value: Number(condition.value),
                    })),
                    effectiveFrom: dateToday(),
                    active: true,
                    employeeid: employeeId,
               });
               if (response?.status !== 'success') throw new Error(response?.message || 'Formula could not be saved');
               toast.success(editingFormulaId ? 'Formula updated as a new version' : 'Formula version saved');
               resetFormulaForm();
               await loadConfiguration();
          } catch (error: any) {
               toast.error(error?.message || 'Formula could not be saved');
          } finally {
               setSaving(false);
          }
     };

     const deactivateFormula = async (formula: FormulaRecord) => {
          if (!employeeId) return toast.error('Your employee session could not be identified.');
          const formulaInputs = parseJson<FormulaInput[]>(formula.input_parameters) || [];
          const formulaConditions = parseJson<FormulaCondition[]>(formula.conditions) || [];
          setSaving(true);
          try {
               const response = await customFetchMutation('testpanel/calculations', 'PUT', {
                    testId: Number(testid),
                    outputFieldId: Number(formula.output_field_id),
                    expression: formula.expression,
                    inputParameters: formulaInputs,
                    unit: formula.unit || undefined,
                    decimalPrecision: Number(formula.decimal_precision),
                    conditions: formulaConditions,
                    effectiveFrom: dateToday(),
                    active: false,
                    employeeid: employeeId,
               });
               if (response?.status !== 'success') throw new Error(response?.message || 'Formula could not be deactivated');
               toast.success('Formula deactivated');
               await loadConfiguration();
          } catch (error: any) {
               toast.error(error?.message || 'Formula could not be deactivated');
          } finally {
               setSaving(false);
          }
     };

     const parameterName = (id: number) => parameters.find((parameter) => parameter.id === id)?.name || `Field ${id}`;

     if (loading) return <div className="py-4 text-center"><Spinner size="sm" className="me-2" />Loading calculation settings</div>;

     return (
          <section className="mx-2">
               <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                         <h2 className="h5 mb-1">Calculated Parameters</h2>
                         <div className="text-muted small">{testname || 'Test'} · Formulas are versioned and calculated on the server.</div>
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={() => void loadConfiguration()}>Refresh</Button>
               </div>

               <div className={styles.editorLayout}>
                    <div className={styles.editor}>
                         <div id="calculation-formula-editor" className="border rounded p-3 mb-4 bg-white">
                              <h3 className="h6">{editingFormulaId ? 'Edit Formula' : 'Add Formula Version'}</h3>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <Form.Label>Calculated parameter</Form.Label>
                                        <Form.Select value={outputFieldId} onChange={(event) => setOutputFieldId(event.target.value)}>
                                             <option value="">Select output field</option>
                                             {parameters.map((parameter) => <option key={parameter.id} value={parameter.id}>{parameter.name}</option>)}
                                        </Form.Select>
                                   </div>
                                   <div className="col-md-3">
                                        <Form.Label>Output unit</Form.Label>
                                        <Form.Control value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="e.g. U/L" />
                                   </div>
                                   <div className="col-md-3">
                                        <Form.Label>Decimal places</Form.Label>
                                        <Form.Control type="number" min={0} max={12} step={1} value={precision} onChange={(event) => setPrecision(Number(event.target.value))} />
                                   </div>
                                   <div className="col-12">
                                        <Form.Label>Formula expression</Form.Label>
                                        <Form.Control value={expression} onChange={(event) => setExpression(event.target.value)} placeholder="(A * B) / D" />
                                        <Form.Text muted>Use the input letters below in your expression. For example, write A / B to divide input A by input B.</Form.Text>
                                   </div>
                                   <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                             <Form.Label className="mb-0">Input mappings</Form.Label>
                                             <Button variant="outline-primary" size="sm" onClick={addInput}>Add input</Button>
                                        </div>
                                        <div className="d-flex flex-column gap-2">
                                             {inputs.map((input, index) => (
                                                  <div className="row g-2 align-items-end" key={`input-${index}`}>
                                                       <div className="col-sm-2">
                                                            <Form.Label>Token</Form.Label>
                                                            <Form.Control value={input.token} onChange={(event) => updateInput(index, { token: event.target.value })} placeholder="A" />
                                                       </div>
                                                       <div className="col-sm-6">
                                                            <Form.Label>Input parameter</Form.Label>
                                                            <Form.Select value={input.fieldId} onChange={(event) => {
                                                                 const selected = parameters.find((parameter) => parameter.id === Number(event.target.value));
                                                                 updateInput(index, { fieldId: event.target.value, unit: selected?.units || '' });
                                                            }}>
                                                                 <option value="">Select input field</option>
                                                                 {parameters.map((parameter) => <option key={parameter.id} value={parameter.id}>{parameter.name}</option>)}
                                                            </Form.Select>
                                                       </div>
                                                       <div className="col-sm-3">
                                                            <Form.Label>Unit</Form.Label>
                                                            <Form.Control value={input.unit || ''} onChange={(event) => updateInput(index, { unit: event.target.value })} placeholder="Optional" />
                                                       </div>
                                                       <div className="col-sm-1">
                                                            <Button variant="outline-danger" size="sm" disabled={inputs.length === 1} aria-label="Remove input" title="Remove input" onClick={() => setInputs((current) => current.filter((_, currentIndex) => currentIndex !== index))}>×</Button>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                                   <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                             <Form.Label className="mb-0">Optional numeric conditions</Form.Label>
                                             <Button variant="outline-secondary" size="sm" onClick={() => setConditions((current) => [...current, { inputToken: '', operator: 'gte', value: '' }])}>Add condition</Button>
                                        </div>
                                        <div className="d-flex flex-column gap-2">
                                             {conditions.map((condition, index) => (
                                                  <div className="row g-2" key={`condition-${index}`}>
                                                       <div className="col-sm-3">
                                                            <Form.Select aria-label="Condition input token" value={condition.inputToken} onChange={(event) => setConditions((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, inputToken: event.target.value } : item))}>
                                                                 <option value="">Input token</option>
                                                                 {inputs.map((input) => input.token.trim()).filter(Boolean).map((token) => <option key={token} value={token}>{token}</option>)}
                                                            </Form.Select>
                                                       </div>
                                                       <div className="col-sm-3">
                                                            <Form.Select aria-label="Condition operator" value={condition.operator} onChange={(event) => setConditions((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, operator: event.target.value as FormulaCondition['operator'] } : item))}>
                                                                 {operators.map((operator) => <option key={operator.value} value={operator.value}>{operator.label}</option>)}
                                                            </Form.Select>
                                                       </div>
                                                       <div className="col-sm-3">
                                                            <Form.Control aria-label="Condition value" type="number" value={condition.value} onChange={(event) => setConditions((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, value: event.target.value } : item))} />
                                                       </div>
                                                       <div className="col-sm-3">
                                                            <Button variant="outline-danger" size="sm" onClick={() => setConditions((current) => current.filter((_, currentIndex) => currentIndex !== index))}>Remove condition</Button>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                                   <div className="col-12 d-flex justify-content-end">
                                        {editingFormulaId !== null && <Button variant="outline-secondary" className="me-2" disabled={saving} onClick={resetFormulaForm}>Cancel Edit</Button>}
                                        <Button variant="primary" disabled={saving || parameters.length === 0} onClick={() => void saveFormula()}>
                                             {saving && <Spinner size="sm" className="me-2" />}{editingFormulaId ? 'Save Revised Version' : 'Save Formula Version'}
                                        </Button>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <aside className={styles.guide} aria-label="Formula guide">
                         <h3 className={styles.guideTitle}>Formula guide</h3>
                         <p className={styles.guideIntro}>Map each input to a letter, then use those letters in your calculation.</p>

                         <div className={styles.example}>
                              <div className={styles.exampleTitle}>Worked example</div>
                              <code className={styles.exampleFormula}>A / B</code>
                              <p className={styles.exampleText}>A = ALT (40), B = AST (20). The result is 2.</p>
                         </div>

                         <h4 className={styles.guideSectionTitle}>Math symbols</h4>
                         <dl className={styles.referenceList}>
                              <dt><code>+</code></dt><dd>Add values</dd>
                              <dt><code>-</code></dt><dd>Subtract values</dd>
                              <dt><code>*</code></dt><dd>Multiply values</dd>
                              <dt><code>/</code></dt><dd>Divide or make a ratio</dd>
                              <dt><code>^</code></dt><dd>Raise to a power</dd>
                              <dt><code>( )</code></dt><dd>Group a calculation</dd>
                         </dl>

                         <h4 className={styles.guideSectionTitle}>Functions</h4>
                         <dl className={styles.referenceList}>
                              <dt><code>sqrt(A)</code></dt><dd>Square root</dd>
                              <dt><code>abs(A)</code></dt><dd>Remove the minus sign</dd>
                              <dt><code>min(A,B)</code></dt><dd>Smaller value</dd>
                              <dt><code>max(A,B)</code></dt><dd>Larger value</dd>
                              <dt><code>log(A)</code></dt><dd>Natural logarithm</dd>
                         </dl>
                    </aside>
               </div>

               <div className="mt-4">
                    <h3 className="h6">Formula History</h3>
                    {formulas.length === 0 ? <p className="text-muted">No formulas configured for this test.</p> : (
                         <div className="table-responsive">
                              <Table striped bordered hover size="sm" className="align-middle">
                                   <thead><tr><th>Output</th><th>Formula</th><th>Inputs</th><th>Version</th><th>Effective</th><th>Status</th><th>Action</th></tr></thead>
                                   <tbody>
                                        {formulas.map((formula) => {
                                             const formulaInputs = parseJson<FormulaInput[]>(formula.input_parameters) || [];
                                             const isActive = formula.active === 1 || formula.active === true;
                                             return (
                                                  <tr key={formula.id}>
                                                       <td>{parameterName(Number(formula.output_field_id))}{formula.unit ? ` (${formula.unit})` : ''}</td>
                                                       <td><code>{formula.expression}</code></td>
                                                       <td>{formulaInputs.map((input) => `${input.token} = ${parameterName(Number(input.fieldId))}`).join(', ')}</td>
                                                       <td>{formula.version}</td>
                                                       <td>{String(formula.effective_from).slice(0, 10)}</td>
                                                       <td>{isActive ? 'Active' : 'Inactive'}</td>
                                                       <td className="d-flex gap-2">
                                                            <Button size="sm" variant="outline-primary" disabled={saving} onClick={() => editFormula(formula)}>Edit</Button>
                                                            {isActive && <Button size="sm" variant="outline-danger" disabled={saving} onClick={() => void deactivateFormula(formula)}>Deactivate</Button>}
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </Table>
                         </div>
                    )}
               </div>
          </section>
     );
}
