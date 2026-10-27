<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCatalog } from '@/composables/useCatalog'
import type { Product } from '@/lib/products'

const { products } = useCatalog()
const days = ref(10)
const country = ref('')

const countries = computed(() =>
  [...new Set(products.value.map((p) => p.country_name))].sort((a, b) => a.localeCompare(b, 'fr')),
)

// Si le pays choisi disparaît (fichier retiré), on retombe sur le premier
watchEffect(() => {
  if (!countries.value.includes(country.value)) country.value = countries.value[0] ?? ''
})

const price = (p: Product) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency || 'EUR' }).format(p.price)

// Carte la plus proche de la durée (en dessous ou au-dessus), puis la moins chère à cette durée
function pick(list: Product[], target: number, side: 'below' | 'above') {
  const cands = list.filter((p) =>
    side === 'below' ? p.validity_days < target : p.validity_days >= target,
  )
  if (!cands.length) return null
  const days = cands.map((p) => p.validity_days)
  const best = side === 'below' ? Math.max(...days) : Math.min(...days)
  return cands
    .filter((p) => p.validity_days === best)
    .reduce((a, b) => (b.price < a.price ? b : a))
}

const cards = computed(() => {
  const target = Number(days.value)
  const list = products.value.filter(
    (p) =>
      p.country_name === country.value &&
      Number.isFinite(p.price) &&
      Number.isFinite(p.validity_days),
  )
  if (!(target > 0)) return []

  const below = pick(list, target, 'below')
  const above = pick(list, target, 'above')

  return [
    {
      key: 'below',
      title: 'Juste en dessous',
      product: below,
      note: below ? `${target - below.validity_days} jour(s) de moins que ton séjour` : '',
      empty: 'Aucune carte plus courte pour ce pays.',
      recommended: false,
    },
    {
      key: 'above',
      title: 'Juste au-dessus',
      product: above,
      note: above
        ? above.validity_days === target
          ? 'Durée exacte'
          : `Couvre tout le séjour (+${above.validity_days - target} j)`
        : '',
      empty: 'Aucune carte assez longue pour ce séjour.',
      recommended: true,
    },
  ]
})
</script>

<template>
  <section class="flex flex-col gap-5 rounded-2xl bg-[#12303A] p-6 text-white">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-xl font-extrabold">Mon voyage</h2>
        <p class="text-sm text-slate-300">
          Indique la durée de ton séjour, on te propose la carte la plus adaptée.
        </p>
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1.5">
          <Label for="trip-days" class="text-slate-300">Durée (jours)</Label>
          <Input
            id="trip-days"
            v-model="days"
            type="number"
            min="1"
            class="h-11 w-28 bg-white font-bold text-slate-900"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="trip-country" class="text-slate-300">Pays</Label>
          <select
            id="trip-country"
            v-model="country"
            class="h-11 min-w-44 rounded-md bg-white px-3 text-sm font-semibold text-slate-900"
          >
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-for="c in cards"
        :key="c.key"
        class="flex flex-col gap-2 rounded-xl p-5"
        :class="c.recommended ? 'bg-white text-slate-900' : 'bg-white/10'"
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="text-sm font-bold"
            :class="c.recommended ? 'text-teal-800' : 'text-slate-300'"
          >
            {{ c.title }}<template v-if="c.product"> · {{ c.product.validity_days }} jours</template>
          </span>
          <Badge v-if="c.recommended && c.product">Recommandé</Badge>
        </div>

        <template v-if="c.product">
          <div class="text-3xl font-extrabold">{{ price(c.product) }}</div>
          <div class="text-sm" :class="c.recommended ? 'text-slate-600' : 'text-slate-300'">
            {{ c.product.data_display }} · {{ c.product.provider }} · {{ c.note }}
          </div>
          <div class="text-xs" :class="c.recommended ? 'text-slate-500' : 'text-slate-400'">
            {{ c.product.product_name }}
          </div>
        </template>
        <p v-else class="text-sm" :class="c.recommended ? 'text-slate-600' : 'text-slate-300'">
          {{ c.empty }}
        </p>
      </div>
    </div>
  </section>
</template>
