import Papa from 'papaparse'

export interface Product {
  sku: string
  provider: string
  product_name: string
  country_code: string
  country_name: string
  data_gb: number
  data_display: string
  validity_days: number
  price: number
  currency: string
  network: string
  top_up: string
}

export interface CsvFile {
  name: string
  products: Product[]
  preloaded: boolean
}

// Parse le texte d'un CSV (sert aussi pour les fichiers ajoutés à la volée)
export function parseCsv(text: string): Product[] {
  const { data } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })
  return data.map((r) => ({
    ...(r as any),
    data_gb: Number(r.data_gb),
    validity_days: Number(r.validity_days),
    price: Number(r.price),
  }))
}

// Vite lit tous les CSV du dossier et les embarque dans le build
const files = import.meta.glob('../data/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function loadPreloaded(): CsvFile[] {
  return Object.entries(files).map(([path, text]) => ({
    name: path.split('/').pop()!,
    products: parseCsv(text),
    preloaded: true,
  }))
}
