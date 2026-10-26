<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import { useStats } from '@/composables/useStats'

const { stats } = useStats()

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const num = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

const kpis = computed(() => {
  const s = stats.value
  const pct = s.total ? Math.round((s.over100 / s.total) * 100) : 0
  return [
    { label: 'Cartes eSIM', value: num.format(s.total), sub: 'produits au catalogue' },
    { label: 'Produits à +100 €', value: num.format(s.over100), sub: `${pct} % du catalogue` },
    {
      label: 'Fourchette de prix',
      value: `${eur.format(s.minPrice)} – ${eur.format(s.maxPrice)}`,
      sub: 'du moins cher au plus cher',
    },
    { label: 'Prix moyen', value: eur.format(s.avgPrice), sub: 'tous fournisseurs confondus' },
    { label: 'Data moyenne', value: `${num.format(s.avgGb)} Go`, sub: 'par carte' },
  ]
})
</script>

<template>
  <div>
    <Card v-for="k in kpis" :key="k.label" class="gap-2 p-5">
      <div class="text-sm font-semibold text-muted-foreground">{{ k.label }}</div>
      <div class="text-3xl font-extrabold leading-tight tracking-tight">{{ k.value }}</div>
      <div class="text-sm text-muted-foreground">{{ k.sub }}</div>
    </Card>
  </div>
</template>
