import { computed } from 'vue'
import { useCatalog } from '@/composables/useCatalog'

const sum = (a: number[]) => a.reduce((s, n) => s + n, 0)

export function useStats() {
  const { products } = useCatalog()

  const stats = computed(() => {
    const list = products.value
    // On ignore les valeurs non numériques (ex : data "illimité" → NaN)
    const prices = list.map((p) => p.price).filter(Number.isFinite)
    const gbs = list.map((p) => p.data_gb).filter(Number.isFinite)

    return {
      total: list.length,
      over100: prices.filter((p) => p > 100).length,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      avgPrice: prices.length ? sum(prices) / prices.length : 0,
      avgGb: gbs.length ? sum(gbs) / gbs.length : 0,
    }
  })

  const byProvider = computed(() => {
    const m = new Map<string, number>()
    for (const p of products.value) m.set(p.provider, (m.get(p.provider) ?? 0) + 1)
    return [...m].map(([label, value]) => ({ label, value }))
  })

  const priceBuckets = computed(() => {
    const defs = [
      { label: '0–10 €', max: 10 },
      { label: '10–25 €', max: 25 },
      { label: '25–50 €', max: 50 },
      { label: '50–100 €', max: 100 },
      { label: '+100 €', max: Infinity },
    ]
    const counts = defs.map(() => 0)
    for (const p of products.value) {
      if (!Number.isFinite(p.price)) continue
      counts[defs.findIndex((d) => p.price <= d.max)]++
    }
    return defs.map((d, i) => ({ label: d.label, value: counts[i] }))
  })

  const pricePerGb = computed(() => {
    const m = new Map<string, number[]>()
    for (const p of products.value) {
      if (!Number.isFinite(p.price) || !(p.data_gb > 0)) continue
      m.set(p.provider, [...(m.get(p.provider) ?? []), p.price / p.data_gb])
    }
    return [...m].map(([label, v]) => ({
      label,
      value: Math.round((sum(v) / v.length) * 100) / 100,
    }))
  })

  return {
    stats,
    byProvider,
    priceBuckets,
    pricePerGb
  }
}
