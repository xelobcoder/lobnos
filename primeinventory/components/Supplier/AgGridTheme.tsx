import { themeQuartz, iconSetQuartzLight } from "ag-grid-community";
export const myTheme = themeQuartz
    .withPart(iconSetQuartzLight)
    .withParams({
        accentColor: "#087AD1",
        backgroundColor: "#FFFFFF",
        borderColor: "#D7E2E6",
        borderRadius: 2,
        browserColorScheme: "light",
        cellHorizontalPaddingScale: 0.7,
        cellTextColor: "#080A0D",
        chromeBackgroundColor: {
            ref: "backgroundColor"
        },
        columnBorder: false,
        fontFamily: {
            googleFont: "Inter"
        },
        fontSize: 13,
        foregroundColor: "#555B62",
        headerBackgroundColor: "#FFFFFF",
        headerFontSize: 13,
        headerFontWeight: 400,
        headerTextColor: "#84868B",
        rowBorder: true,
        rowVerticalPaddingScale: 0.8,
        sidePanelBorder: true,
        spacing: 8,
        wrapperBorder: false,
        wrapperBorderRadius: 2
    });



