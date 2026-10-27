<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCatalog } from '@/composables/useCatalog'
import type { Product } from '@/lib/products'

const { products } = useCatalog()

const search = ref('')
const provider = ref('all')
const budget = ref('')
const minGb = ref('')
const sort = ref('price-asc')
const PAGE = 50
const limit = ref(PAGE)

const providers = computed(() => [...new Set(products.value.map((p) => p.provider))].sort())

const sorts: Record<string, { label: string; key: (p: Product) => number; dir: 1 | -1 }> = {
  'price-asc': { label: 'Prix croissant', key: (p) => p.price, dir: 1 },
  'price-desc': { label: 'Prix décroissant', key: (p) => p.price, dir: -1 },
  'days-asc': { label: 'Durée (courte → longue)', key: (p) => p.validity_days, dir: 1 },
  'days-desc': { label: 'Durée (longue → courte)', key: (p) => p.validity_days, dir: -1 },
  'data-desc': { label: 'Data (la plus grosse)', key: (p) => p.data_gb, dir: -1 },
  'pergb-asc': { label: 'Prix par Go (le moins cher)', key: (p) => p.price / p.data_gb, dir: 1 },
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const maxPrice = budget.value === '' ? Infinity : Number(budget.value)
  const min = minGb.value === '' ? 0 : Number(minGb.value)

  const list = products.value.filter((p) => {
    if (provider.value !== 'all' && p.provider !== provider.value) return false
    if (!(p.price <= maxPrice)) return false
    if (min > 0 && !(p.data_gb >= min)) return false
    if (q) {
      const hay = `${p.sku} ${p.product_name} ${p.country_name} ${p.network} ${p.provider}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const { key, dir } = sorts[sort.value]
  return list.sort((a, b) => {
    const x = key(a)
    const y = key(b)
    const xOk = Number.isFinite(x)
    const yOk = Number.isFinite(y)
    if (!xOk && !yOk) return 0
    if (!xOk) return 1 // valeurs inconnues toujours à la fin
    if (!yOk) return -1
    return (x - y) * dir
  })
})

const shown = computed(() => filtered.value.slice(0, limit.value))

// Quand un filtre change, on revient à la première page
watch([search, provider, budget, minGb, sort, products], () => (limit.value = PAGE))

const price = (p: Product) =>
  Number.isFinite(p.price)
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency || 'EUR' }).format(p.price)
    : '—'

const selectClass =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
</script>

<template>
  <Card class="gap-5 p-5">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h2 class="text-lg font-bold">Tous les produits</h2>
      <span class="text-sm text-muted-foreground">
        {{ filtered.length }} résultat(s) sur {{ products.length }}
      </span>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex min-w-56 flex-[2] flex-col gap-1.5">
        <Label for="f-search">Recherche</Label>
        <Input id="f-search" v-model="search" class="h-11" placeholder="Pays, produit, SKU…" />
      </div>
      <div class="flex min-w-40 flex-1 flex-col gap-1.5">
        <Label for="f-provider">Fournisseur</Label>
        <select id="f-provider" v-model="provider" :class="selectClass">
          <option value="all">Tous</option>
          <option v-for="p in providers" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="flex min-w-32 flex-1 flex-col gap-1.5">
        <Label for="f-budget">Budget max (€)</Label>
        <Input id="f-budget" v-model="budget" type="number" min="0" class="h-11" placeholder="50" />
      </div>
      <div class="flex min-w-32 flex-1 flex-col gap-1.5">
        <Label for="f-gb">Data min (Go)</Label>
        <Input id="f-gb" v-model="minGb" type="number" min="0" class="h-11" placeholder="5" />
      </div>
      <div class="flex min-w-44 flex-1 flex-col gap-1.5">
        <Label for="f-sort">Trier par</Label>
        <select id="f-sort" v-model="sort" :class="selectClass">
          <option v-for="(s, k) in sorts" :key="k" :value="k">{{ s.label }}</option>
        </select>
      </div>
    </div>

    <!-- Tableau (le composant Table gère déjà le scroll horizontal) -->
    <Table class="min-w-[860px]">
      <TableHeader>
        <TableRow class="bg-muted/50 text-xs uppercase">
          <TableHead>SKU</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Produit</TableHead>
          <TableHead>Pays</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Durée</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Réseau</TableHead>
          <TableHead>Top-up</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="p in shown" :key="`${p.provider}-${p.sku}`">
          <TableCell class="font-mono text-xs text-muted-foreground">{{ p.sku }}</TableCell>
          <TableCell class="font-semibold">{{ p.provider }}</TableCell>
          <TableCell>{{ p.product_name }}</TableCell>
          <TableCell>{{ p.country_name }}</TableCell>
          <TableCell>{{ p.data_display }}</TableCell>
          <TableCell>{{ p.validity_days }} j</TableCell>
          <TableCell class="font-extrabold">{{ price(p) }}</TableCell>
          <TableCell>{{ p.network }}</TableCell>
          <TableCell>{{ p.top_up }}</TableCell>
        </TableRow>
        <TableRow v-if="!shown.length">
          <TableCell colspan="9" class="py-8 text-center text-muted-foreground">
            Aucun produit ne correspond à ces filtres.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div v-if="filtered.length > shown.length" class="flex justify-center">
      <Button variant="outline" @click="limit += PAGE">
        Afficher {{ Math.min(PAGE, filtered.length - shown.length) }} de plus
      </Button>
    </div>
  </Card>
</template>
