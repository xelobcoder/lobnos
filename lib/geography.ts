import { customFetch } from "../components/Auth/customFetch";

export interface GeographyCountry {
     name: string;
     iso2: string;
     divisionLabel: string;
     phone: { callingCode: string };
}

export interface GeographyDivision {
     name: string;
     type: string;
}

export interface GeographyDistrict {
     id: number;
     name: string;
     code: string;
}

export interface GeographyRegion {
     id: number;
     name: string;
     regioncode: string;
     districts: GeographyDistrict[];
}

export async function fetchGeographyCountries(): Promise<GeographyCountry[]> {
     const response = await customFetch("geography/countries");
     if (response?.status !== "success" || !Array.isArray(response.result)) {
          throw new Error(response?.message || "Unable to load countries");
     }
     return response.result;
}

export async function fetchGeographyDivisions(countryCode: string): Promise<GeographyDivision[]> {
     const response = await customFetch(`geography/countries/${encodeURIComponent(countryCode)}/divisions`);
     if (response?.status !== "success" || !Array.isArray(response.result?.divisions)) {
          throw new Error(response?.message || "Unable to load administrative divisions");
     }
     return response.result.divisions;
}

export async function fetchGeographyRegions(countryCode: string): Promise<GeographyRegion[]> {
     const response = await customFetch(`locations/regions-districts?country=${encodeURIComponent(countryCode)}`);
     if (response?.status !== "success" || !Array.isArray(response.data)) {
          throw new Error(response?.message || "Unable to load regions and districts");
     }
     return response.data;
}

export function findCountry(countries: GeographyCountry[], value?: string | null): GeographyCountry | undefined {
     const normalized = String(value ?? "").trim().toUpperCase();
     return countries.find(country => country.iso2.toUpperCase() === normalized || country.name.toUpperCase() === normalized);
}
