export const GAS_WEB_APP_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzKqCNRIPzEsElUeDdpVRqLUc30iwnl9-DdEa-zfV1d_BAUjcvNt12VUgHYMRWYF7R9_A/exec";
export const GAS_API_KEY = import.meta.env.VITE_API_KEY || "your_secret_key_here";

/**
 * Service for communicating with Google Apps Script Backend
 */
export class GASService {
  /**
   * Generic request function to call Google Apps Script
   */
  static async request(action: string, sheet?: string, data?: any) {
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
      throw new Error("Please configure your Google Apps Script Web App URL in GASService.");
    }

    const payload = {
      action,
      sheet,
      data,
      apiKey: GAS_API_KEY,
    };

    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // text/plain is used to avoid CORS preflight issues with GAS
        },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      const result = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.message);
      }
      return result;
    } catch (error) {
      console.warn(`GAS API Warning [${action}] (Graceful Fallback Mode):`, error);
      throw error;
    }
  }

  /**
   * Read data from a specific sheet
   */
  static async read(sheet: string, limit?: number, offset?: number) {
    return this.request("read", sheet, { limit, offset });
  }

  /**
   * Write one or multiple rows to a specific sheet
   */
  static async write(sheet: string, data: any | any[]) {
    return this.request("write", sheet, data);
  }

  /**
   * Update one or multiple rows in a specific sheet
   * Note: Data objects MUST include the 'id' field
   */
  static async update(sheet: string, data: any | any[]) {
    return this.request("update", sheet, data);
  }

  /**
   * Delete one or multiple rows in a specific sheet
   * Note: Data objects MUST include the 'id' field
   */
  static async delete(sheet: string, data: { id: string | number } | { id: string | number }[]) {
    return this.request("delete", sheet, data);
  }

  /**
   * Lookup specific data in a sheet matching the criteria
   */
  static async lookup(sheet: string, criteria: any, matchType: "exact" | "includes" = "exact") {
    return this.request("lookup", sheet, [{ ...criteria, matchType }]);
  }
}
