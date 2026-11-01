"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import CreateTestFields from '../../FieldsCreation/createfieldsComponent';
import TestEditorLoading from '../TestEditorLoading';
import {testEditorArray, testEditorDetail} from '../../../../lib/testEditorData';
import ui from '../../../Billing/billing-strategy/StrategyWorkspace.module.css';

export default function FieldsTab({ testid, testname }: { testid: number; testname?: string }) {
     const [testdata, setTestdata] = useState<any>(null);
     const [fieldConstraintsCategorization, setFieldConstraintsCategorization] = useState<any>(null);
     const [testRules, setTestRules] = useState<any>(null);
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(true);
     const version = useRef(0);

     const fetchData = useCallback(async () => {
          const ticket = ++version.current;
          setError('');
          if (Number.isSafeInteger(Number(testid)) && Number(testid) > 0) {
               try {
                    setLoading(true);
                    const [td, fc, tr] = await Promise.all([
                         customFetch(`gettestpanel/edit?id=${testid}`),
                         customFetch(`test/fields/category/test/${testid}`),
                         customFetch(`testpanel/list/customtestrule?testid=${testid}`)
                    ]);

                    if (ticket !== version.current) return;
                    const detail = testEditorDetail(td);
                    const categories = testEditorArray(fc, 'parameter categories');
                    const rules = testEditorArray(tr, 'test parameters');
                    if (rules.some(rule => rule == null || typeof rule !== 'object' || !('name' in rule) || typeof rule.name !== 'string' || !rule.name.trim())) throw new Error('Unable to load test parameters: invalid field data.');
                    setTestdata(detail);
                    setFieldConstraintsCategorization(categories);
                    setTestRules(rules);
               } catch (err) {
                    if (ticket === version.current) setError(err instanceof Error ? err.message : 'Unable to load test parameters.');
               } finally {
                    if (ticket === version.current) setLoading(false);
               }
          } else {
               setError('A valid test identifier is required.');
               setLoading(false);
          }
     }, [testid]);

     useEffect(() => {
          void fetchData();
          return () => { version.current++; };
     }, [fetchData]);

     if (loading) {
          return <TestEditorLoading label="Loading parameters, categories and field rules" />;
     }

     if (error || !testid) {
          return <div className={ui.error} role="alert"><span>{error}</span><button className={ui.secondary} type="button" onClick={() => void fetchData()}>Retry loading parameters</button></div>;
     }

     return (
          <div>
               <CreateTestFields
                    fieldConstraintsCategorization={fieldConstraintsCategorization}
                    testRules={testRules}
                    testdata={testdata}
                    testname={testdata?.name || testname}
                    testid={testid}
                    onRefresh={fetchData}
               />
          </div>
     );
}
