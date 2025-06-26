"use client";
import { useEffect, useState, useCallback } from "react";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import RulesLoadingTempleteCreation from "../../../../../components/operations/Ultrasound/RulesLoadingTempleteCreation";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import Loader from "../../../../../components/accessories/Loader";

interface UltrasoundTest {
  id: number;
  name: string;
}

interface TemplateField {
  field: string;
  value: string;
  fieldid: number;
  [key: string]: any;
}

interface TemplateDetails {
  employeeid?: string;
  testid: number;
  associatedbodypart: string;
  visibleToAll: number;
  fields: TemplateField[];
  keyid?: number | null;
  name: string;
}

export default function CreateUltrasonographyTemplates() {
  const { user } = useApplicationSettings().applicationsettings;
  const employeeid = user?.employeeid;
  const [ultrasoundList, setUltrasoundList] = useState<UltrasoundTest[]>([]);
  const [name, setName] = useState<string>('');
  const [associatedbodypart, setBodyPart] = useState<string>('');
  const [visible, setVisible] = useState<number>(1);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [rulesLoading, setRulesLoading] = useState<boolean>(true);
  const [rule, setRule] = useState<TemplateField[]>([]);
  const [impression, setImpression] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const isEdit = searchParams?.get("isEdit");
  const templateid = searchParams?.get("templateid");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customFetch(`testpanel/list/ultrasound`);
      setUltrasoundList(data);
    } catch (err) {
      console.error("Failed to fetch ultrasound list:", err);
      setUltrasoundList([]);
      toast.error("Failed to load ultrasound tests");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCreationRule = useCallback(async () => {
    if (!selectedTest) return;

    try {
      setRulesLoading(true);
      const rules = await customFetch(`testpanel/list/customtestrule?testid=${selectedTest}`);
      if (Array.isArray(rules) && rules.length > 0) {
        setRule(rules);
      }
    } catch (err) {
      console.error("Failed to fetch creation rules:", err);
      setRule([]);
      toast.error("Failed to load template rules");
    } finally {
      setRulesLoading(false);
    }
  }, [selectedTest]);

  const getTemplateDetails = useCallback(async () => {
    if (!templateid || !isEdit) return;

    try {
      setRulesLoading(true);
      const response = await customFetch(`testpanel/list/ultrasound/get/template?templateid=${templateid}`);

      const { fields, name, visibletoAll, associatedbodypart, testid } = response;
      setRule(fields);
      setName(name);
      setSelectedTest(testid);
      setVisible(visibletoAll);
      setBodyPart(associatedbodypart);

      const impressionField = fields.find(item => item.field === "impression");
      setImpression(impressionField?.value || "");
    } catch (err) {
      console.error("Failed to fetch template details:", err);
      setRule([]);
      toast.error("Failed to load template details");
    } finally {
      setRulesLoading(false);
    }
  }, [isEdit, templateid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedTest && (!templateid || !isEdit)) {
      getCreationRule();
    }
  }, [selectedTest, templateid, isEdit, getCreationRule]);

  useEffect(() => {
    if (isEdit && templateid) {
      getTemplateDetails();
    }
  }, [isEdit, templateid, getTemplateDetails]);

  const handleFieldChange = (data: string, index: number) => {
    setRule(prev => prev.map((item, i) =>
      i === index ? { ...item, value: data } : item
    ));
  };

  const createTemplateHandler = async () => {
    if (!selectedTest || !name || !employeeid) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const templateDetails: TemplateDetails = {
        employeeid,
        testid: parseInt(selectedTest),
        associatedbodypart,
        visibleToAll: visible,
        fields: [
          ...rule,
        ],
        keyid: templateid ? parseInt(templateid) : null,
        name
      };

      const method = templateid && isEdit ? 'PUT' : 'POST';
      const response = await customPost(
        `result/entry/ultrasound/templates/creation`,
        method,
        templateDetails
      );

      const message = templateid ? "updated" : "created";
      if (response.status) {
        toast.success(`Template ${message} successfully`);
      } else {
        toast.error(`Template ${message} failed`);
      }
    } catch (err) {
      console.error("Template operation failed:", err);
      toast.error("An error occurred while processing your request");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-2">
      <div className="p-2 bg-secondary-subtle heightedBorder my-2 br-0">
        Creating Ultrasound Impression Templates
      </div>
      <form className="my-2 heightedBorder text-sm bg-body-secondary p-3 br-0">
        <div className="grid-reg my-2">
          <label>Name of Template</label>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className="custom-input pls-color text-sm"
            type="text"
            placeholder="Please type name of pathology or template here"
          />
        </div>
        <div className="grid-reg">
          <label>Ultrasound Scan</label>
          <select
            className="custom-select pls-color text-sm text-capitalize"
            value={selectedTest || ''}
            disabled={!!templateid}
            onChange={(ev) => setSelectedTest(ev.target.value)}
          >
            <option value="">Select an option here</option>
            {ultrasoundList.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="grid-reg my-2">
          <label>Associated Body Part</label>
          <select
            value={associatedbodypart}
            onChange={(ev) => setBodyPart(ev.target.value)}
            className="custom-select text-capitalize pls-color text-sm"
          >
            <option value="">select body part</option>
            <option value="Kidney">Kidney</option>
            <option value="Uterus">Uterus</option>
          </select>
        </div>
        <div className="grid-reg my-2">
          <label>Visible to all Sonographers</label>
          <select
            value={visible}
            onChange={(ev) => setVisible(Number(ev.target.value))}
            className="custom-select pls-color text-sm text-capitalize"
          >
            <option value={1}>Yes</option>
            <option value={0}>No</option>
          </select>
        </div>
      </form>

      <RulesLoadingTempleteCreation
        rule={rule}
        impression={impression}
        setImpression={setImpression}
        selected={selectedTest}
        handleFieldChange={handleFieldChange}
        rulesLoading={rulesLoading}
      />

      {rule.length > 0 && (
        <button
          className="btn btn-primary btn-sm"
          onClick={createTemplateHandler}
          disabled={rulesLoading}
        >
          Save Template Information
        </button>
      )}
    </div>
  );
}