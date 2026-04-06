export interface MasterTestPanel {
     id: number;
     name: string;
     shorttext?: string;
     category?: number;
     sample?: number;
     sample_container?: number | string;
     qty_required?: number | string;
     unit?: string;
     price?: number;
     testprice?: number;
     testcost?: number;
     reportitle?: string;
     method?: string;
     instrumentation?: string;
     description?: string;
     iscustom?: number;
     // configurations
     hasManual?: number;
     showtrend?: number;
     hasGenderVariation?: number;
     hasChildrenLimit?: number;
     isoutsourced?: number;
     hasDrugs?: number;
     useLiterature?: number;
     procedureCode?: string;
     // TAT
     tatCount?: number | string;
     tatEvaluation?: string;
     pre_Tat?: number | string;
     pre_TatEvaluation?: string;
     tat?: number | string;
     post_Tat?: number | string;
     post_TatEvaluation?: string;
}

export interface MasterFieldRule {
     id?: number;
     testid?: number;
     name: string;
     plan: string;
     field?: string;
     value?: string;
     hasunits?: number | boolean;
     units?: string;
     options?: string | string[];
     textReference?: string;
     plain?: string;
     isValueTracked?: number | boolean;
     isRequired?: boolean;
     category?: string;
     undercategory?: number | boolean;
     categoryid?: number | string | null;
     valueAlert?: string | null;
     alert?: string | null;
     lowerlimit?: string | number | null;
     upperlimit?: string | number | null;
     lowerLimitFemale?: string | number | null;
     upperLimitFemale?: string | number | null;
     lowerLimitMale?: string | number | null;
     upperLimitMale?: string | number | null;
     lowerLimitChildren?: string | number | null;
     upperLimitChildren?: string | number | null;
     lowerLimitNeonates?: string | number | null;
     upperLimitNeonates?: string | number | null;
     ordering?: number;
}

export interface FieldCategory {
     categoryid: string | number;
     categoryname: string;
}

export interface LookupOption {
     id: number;
     name: string;
}

export interface MasterFormLookupData {
     departments: LookupOption[];
     sampleTypes: LookupOption[];
     sampleContainers: Array<{ id: number; name: string; volume_capacity?: number | null }>;
}
