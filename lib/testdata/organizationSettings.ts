export interface TestItem {
	discountedValue?: number;
	price: number;
	name: string;
	id?: number;
	testid: number;
	concessionMode: 'none' | 'absolute' | 'percentage';
	isoutsourced: number;
	concessionValue: number;
}

export interface OrganizationPricingSettings {
	useCustomLetterHeadings: boolean;
	hasConcessionAppliedAcross: boolean;
	concessionMode: 'none' | 'absolute' | 'percentage';
	concessionValue: number;
	haveDifferentPriceList: boolean;
	saved: boolean;
	testList: TestItem[];
}

export const organizationPricingsettingsDefaultData: OrganizationPricingSettings = {
	useCustomLetterHeadings: false,
	hasConcessionAppliedAcross: true,
	concessionMode: "none",
	concessionValue: 0,
	haveDifferentPriceList: false,
	saved: false,
	testList: []
}