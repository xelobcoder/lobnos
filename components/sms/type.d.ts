
export interface TableColumn {
     field: string;
     value: string;
}
export type PlaceholderColumnSelectionType = TableColumn & { category: string }


export interface SmsTemplateFormState {
     templateName: string;
     smscontent: string;
     placeholders: PlaceholderColumnSelectionType[] | []
     selectedCategory: Omit<SmsCategoryType, 'isBulk'> | null;
     createdby: number
}

