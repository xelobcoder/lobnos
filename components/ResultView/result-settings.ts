
export interface ResultSettings {
     fontfamily: string;
     testnameColor: string;
     testnameBackgroundColor: string;
     testnameFontSize: number;
     mainReportHeaderBgColor: string;
     testTableHeaderBackgroundColor: string;
     comments: {
          fontFamily: string;
     },
     testTableHeaderTextColor: string;
     mainReportHeaderColor: string;
     testTableHeaderFontSize: number;
     companyInfo: {
          namefontsize: number;
          color: string;
          breakname: boolean;
          subnameFontSize?: number;
          subnameColor?: string;
          headerType?: string;
          fontFamily?: string;

     };
     patientInfo: {
          fontFamily: string;
     };
     testBody: {
          fontSize: number;
          fontFamily: string;
          color: string;
          highlightFlags: boolean;
          hightFlagColor: string;
          hasColorsForFlags: boolean;
          lowFlagColor: string;
          boldenParameter: boolean;
          boldenValue: boolean;
          boldenUnits: boolean;
          trFirstColumnName: string;
          trSecondColumnName: string;
          trThirdColumnName?: string;
          trFourthColumnName?: string;
          trFifthColumnName?: string;
     };
     includeSignature: boolean;
     includeLimitations: boolean;
     limitations: string;
     showEndOfResult: boolean;
     template: number;
     includeWatermark?: boolean;
     includeBarcode?: boolean;
     useGeneraralValidation?: boolean;
     useIndividualValidations?: boolean;
     showMethod: boolean;
     useReportTitle?: boolean;
     useInstrumentation?: boolean;
     ultrasoundSettings?: {
          fontSize: number;
          fontFamily: string;
          color: string;
          headerBackgroundColor: string;
          headerTextColor: string;
          headerFontSize: number;
          contentFontFamily: string;
          contentFontSize: number;
          contentColor: string;
          lineHeight?: string;
          sectionTitleColor: string;
          sectionTitleFontSize: number;
          showTechnique: boolean;
          showDisclaimer: boolean;
          disclaimerText: string;
          allowUltrasoundImages?: boolean;
     }
}

export const defaultResultSettings: ResultSettings = {
     // fontfamily: 'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
     fontfamily: 'Lexend Deca, Helvetica, Arial, sans-serif',
     // fontFamily:'Cambria, Georgia, serif',
     testnameColor: "black",
     testnameBackgroundColor: 'white',
     testnameFontSize: 16,
     mainReportHeaderBgColor: '#4169e1',
     testTableHeaderBackgroundColor: '#4169e1',
     testTableHeaderTextColor: "black",
     mainReportHeaderColor: 'white',
     testTableHeaderFontSize: 13,
     companyInfo: {
          namefontsize: 14,
          color: "black",
          breakname: true,
          subnameFontSize: 12,
          subnameColor: "black",
          fontFamily: 'Times New Roman, Times, serif'
     },

     patientInfo: {
          fontFamily: 'Times New Roman, Times, serif',
     },

     testBody: {
          fontSize: 15,
          fontFamily: 'Times New Roman, Times, serif',
          color: "black",
          highlightFlags: true,
          hightFlagColor: "#b04545",
          hasColorsForFlags: false,
          lowFlagColor: "#1eb870",
          boldenParameter: true,
          boldenValue: false,
          boldenUnits: false,
          trFirstColumnName: 'Investigation',
          trSecondColumnName: 'Observed Value',
          trThirdColumnName: 'Units',
          trFourthColumnName: 'Range',
          trFifthColumnName: 'Flag',

     },
     includeSignature: true,
     includeLimitations: false,
     limitations: "No limitations",
     useGeneraralValidation: false,
     useIndividualValidations: true,
     includeBarcode: true,
     showEndOfResult: true,
     comments: {
          fontFamily: 'Times New Roman, Times, serif',
     },
     template: 1,
     includeWatermark: true,
     showMethod: true,
     useReportTitle: true,
     ultrasoundSettings: {
          fontSize: 14,
          fontFamily: 'Times New Roman, Times, serif',
          color: 'black',
          headerBackgroundColor: '#4169e1',
          headerTextColor: 'white',
          headerFontSize: 16,
          contentFontFamily: 'Times New Roman, Times, serif',
          contentFontSize: 14,
          contentColor: 'black',
          sectionTitleColor: 'black',
          sectionTitleFontSize: 16,
          showTechnique: true,
          lineHeight: '1.5',
          showDisclaimer: true,
          disclaimerText: 'This is a sample disclaimer text for ultrasound reports.',
          allowUltrasoundImages: true
     }
}
