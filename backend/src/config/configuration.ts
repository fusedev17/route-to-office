export interface AppConfig {
  port: number;
  googleMapsApiKey: string;
  companyLat: number;
  companyLng: number;
  corsOrigins: string[];
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
  companyLat: parseFloat(process.env.COMPANY_LAT ?? '13.805432'),
  companyLng: parseFloat(process.env.COMPANY_LNG ?? '100.5377344'),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});
