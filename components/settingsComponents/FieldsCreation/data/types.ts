export interface CreationRule {
    name: string;
    field: string;
    value: string;
    options: string;
    testid: string;
    category: string;
    undercategory: number;
    hasunits: boolean;
    units: string;
    plan: string;
    plain: string;
    fieldConstraints: Array<any>;
    ordering: string;
    isValueTracked: number;
    textReference: string;
}