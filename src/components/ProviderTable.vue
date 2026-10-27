<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowDown, ArrowUp } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStats } from '@/composables/useStats'

type Key = 'offers' | 'price' | 'perGb'
interface Measure {
  key: Key
  label: string
  bar: string
  tint: string
  better: 'high' | 'low'
  fmt: (v: number) => string
}

const int = new Intl.NumberFormat('fr-FR')
const dec = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const measures: Measure[] = [
  { key: 'offers', label: 'Offres', bar: 'bg-primary', tint: 'bg-primary/10', better: 'high', fmt: (v) => int.format(v) },
  { key: 'price', label: 'Prix moyen', bar: 'bg-orange-500', tint: 'bg-orange-50', better: 'low', fmt: (v) => `${dec.format(v)} €` },
  { key: 'perGb', label: 'Prix / Go', bar: 'bg-blue-600', tint: 'bg-blue-50', better: 'low', fmt: (v) => `${dec.format(v)} €/Go` },
]

const { providerStats } = useStats()

const visible = reactive<Record<Key, boolean>>({ offers: true, price: true, perGb: true })
const shownMeasures = computed(() => measures.filter((m) => visible[m.key]))

const sortKey = ref<Key | 'name'>('offers')
const asc = ref(false)

function sortBy(k: Key | 'name') {
  if (sortKey.value === k) {
    asc.value = !asc.value
  } else {
    sortKey.value = k
    // Par défaut : les meilleurs en haut (A→Z pour le nom)
    asc.value = k === 'name' ? true : measures.find((m) => m.key === k)!.better === 'low'
  }
}

type Row = (typeof providerStats.value)[number]

const rows = computed(() => {
  const list = [...providerStats.value]
  const k = sortKey.value
  return list.sort((a, b) => {
    if (k === 'name') return (asc.value ? 1 : -1) * a.name.localeCompare(b.name, 'fr')
    const x = a[k]
    const y = b[k]
    const xOk = Number.isFinite(x)
    const yOk = Number.isFinite(y)
    if (!xOk && !yOk) return 0
    if (!xOk) return 1 // valeurs inconnues toujours à la fin
    if (!yOk) return -1
    return asc.value ? x - y : y - x
  })
})

// Maximum (pour la longueur des barres) et meilleure valeur de chaque mesure
const limits = computed(() => {
  const out = {} as Record<Key, { max: number; best: number }>
  for (const m of measures) {
    const vals = providerStats.value.map((r) => r[m.key]).filter(Number.isFinite)
    out[m.key] = {
      max: vals.length ? Math.max(...vals) : 0,
      best: !vals.length ? NaN : m.better === 'high' ? Math.max(...vals) : Math.min(...vals),
    }
  }
  return out
})

const isBest = (r: Row, m: Measure) => r[m.key] === limits.value[m.key].best
const pct = (r: Row, m: Measure) => `${Math.round((r[m.key] / limits.value[m.key].max) * 100)}%`
</script>

<template>
  <Card class="gap-5 p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-extrabold">Comparatif fournisseurs</h2>
        <p class="text-sm text-muted-foreground print:hidden">
          Clique sur un en-tête pour trier. Le meilleur de chaque colonne est surligné.
        </p>
      </div>

      <!-- Choix des mesures (masqué à l'impression) -->
      <fieldset data-html2canvas-ignore class="flex flex-col gap-2 print:hidden">
        <legend class="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Mesures affichées
        </legend>
        <div class="flex flex-wrap gap-2">
          <Label
            v-for="m in measures"
            :key="m.key"
            class="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-input px-3.5 text-sm font-semibold"
          >
            <input v-model="visible[m.key]" type="checkbox" class="size-4.5 accent-primary" />
            {{ m.label }}
          </Label>
        </div>
      </fieldset>
    </div>

    <Table class="min-w-[620px]">
      <TableHeader>
        <TableRow class="bg-muted/50 hover:bg-muted/50">
          <TableHead>
            <Button variant="ghost" size="sm" class="-ml-3 h-11 text-xs font-bold uppercase" @click="sortBy('name')">
              Fournisseur
              <template v-if="sortKey === 'name'">
                <ArrowUp v-if="asc" class="size-3.5" />
                <ArrowDown v-else class="size-3.5" />
              </template>
            </Button>
          </TableHead>
          <TableHead v-for="m in shownMeasures" :key="m.key">
            <Button variant="ghost" size="sm" class="-ml-3 h-11 text-xs font-bold uppercase" @click="sortBy(m.key)">
              {{ m.label }}
              <template v-if="sortKey === m.key">
                <ArrowUp v-if="asc" class="size-3.5" />
                <ArrowDown v-else class="size-3.5" />
              </template>
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-for="r in rows" :key="r.name" class="break-inside-avoid">
          <TableCell class="whitespace-nowrap font-bold">{{ r.name }}</TableCell>

          <TableCell v-for="m in shownMeasures" :key="m.key" :class="isBest(r, m) ? m.tint : ''">
            <div v-if="Number.isFinite(r[m.key])" class="flex items-center gap-3">
              <div class="h-2.5 min-w-16 flex-1 rounded-full bg-muted">
                <div class="h-full rounded-full" :class="m.bar" :style="{ width: pct(r, m) }" />
              </div>
              <span
                class="min-w-20 text-right"
                :class="isBest(r, m) ? 'font-extrabold' : 'font-semibold'"
              >
                {{ m.fmt(r[m.key]) }}
              </span>
              <Badge v-if="isBest(r, m)">Meilleur</Badge>
            </div>
            <span v-else class="text-muted-foreground">—</span>
          </TableCell>
        </TableRow>

        <TableRow v-if="!rows.length">
          <TableCell :colspan="1 + shownMeasures.length" class="py-8 text-center text-muted-foreground">
            Aucune donnée : ajoute un fichier CSV.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <p class="text-sm text-muted-foreground">
      Barre longue = plus d'offres. Pour le prix moyen et le prix par Go, une barre courte = moins cher.
    </p>
  </Card>
</template>
