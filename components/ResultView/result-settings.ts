
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
     };
     includeSignature: boolean;
     includeLimitations: boolean;
     limitations: string;
     showEndOfResult: boolean;
     template: number;
     includeWatermark?: boolean;
     includeBarcode?: boolean;
}

export const defaultResultSettings: ResultSettings = {
     // fontfamily: 'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
     fontfamily: 'Lexend Deca, Helvetica, Arial, sans-serif',
     // fontFamily:'Cambria, Georgia, serif',
     testnameColor: "black",
     testnameBackgroundColor: 'white',
     testnameFontSize: 16,
     mainReportHeaderBgColor: '#4169e1',
     testTableHeaderBackgroundColor: 'lightgray',
     testTableHeaderTextColor: "black",
     mainReportHeaderColor: 'white',
     testTableHeaderFontSize: 13,
     companyInfo: {
          namefontsize: 14,
          color: "black",
     },

     testBody: {
          fontSize: 15,
          // fontFamily: 'cambria, Georgia, serif',4
          fontFamily: 'Times New Roman, Times, serif',
          color: "black",
          highlightFlags: false,
          hightFlagColor: "red",
          hasColorsForFlags: false,
          lowFlagColor: "blue",
          boldenParameter: false,
          boldenValue: false,
          boldenUnits: true,
     },
     includeSignature: true,
     includeLimitations: false,
     limitations: "No limitations",
     includeBarcode: true,
     showEndOfResult: true,
     comments: {
          fontFamily: 'Times New Roman, Times, serif',
     },
     template: 1,
     includeWatermark: true,
}
