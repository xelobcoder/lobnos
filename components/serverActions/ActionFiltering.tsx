"use server"
import { customFetch } from "../Auth/customFetch"
export async function filteringDatabaseTables(target: string, filtering: string, column: string, limit: number) {
     try {
          const response = await customFetch(`application/filtering/table/${target}?value=${filtering}&&original=${column}&&limit=${limit}`);
          return response;
     } catch (err) {
          return []
     }
} 