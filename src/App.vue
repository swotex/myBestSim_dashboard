<script setup lang="ts">
import { ref } from 'vue'
import { loadPreloaded } from '@/lib/products'
import CsvImport from './components/CsvImport.vue';
import { useCatalog } from './composables/useCatalog';
import KpiGrid from './components/KpiGrid.vue';
import { useStats } from './composables/useStats';
import BarCard from './components/BarCard.vue';
import TripFinder from './components/TripFinder.vue';
import ProductTable from './components/ProductTable.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// const products = ref(loadPreloaded())
const { products } = useCatalog()
const { byProvider, priceBuckets, pricePerGb, byValidity, avgPriceByProvider } = useStats()
</script>

<template>
  <div class="min-h-screen bg-muted/40 px-4 py-6 sm:px-6 sm:py-8">
    <main class="mx-auto flex max-w-6xl flex-col gap-6">
      <!-- En-tête (inchangé) -->
      <header class="flex flex-wrap items-center justify-between gap-4">
        <!-- ... -->
      </header>

      <CsvImport />

      <Tabs default-value="stats" class="gap-6">
        <TabsList class="h-11">
          <TabsTrigger value="stats" class="px-5">Statistiques</TabsTrigger>
          <TabsTrigger value="compare" class="px-5">Comparateur</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" class="flex flex-col gap-6">
          <KpiGrid class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4" />
          <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <BarCard title="Répartition des prix" :data="priceBuckets" color="#E28A2B" />
            <BarCard title="Répartition par durée de validité" :data="byValidity" color="#7A4FB5" />
            <!-- <BarCard horizontal title="Offres par fournisseur" :data="byProvider" />
            <BarCard horizontal title="Prix moyen par fournisseur (€)" :data="avgPriceByProvider" />
            <BarCard horizontal title="Prix moyen par Go (€)" :data="pricePerGb" color="#3B5BA9" description="Plus la barre est basse, meilleur est le rapport qualité/prix." />
            <BarCard title="Répartition des prix" :data="priceBuckets" color="#E28A2B" />
            <BarCard title="Répartition par durée de validité" :data="byValidity" color="#7A4FB5" /> -->
            <!-- <BarCard horizontal title="Offres par pays (top 8)" :data="topCountries" color="#2F855A" /> -->
          </section>
               <BarCard title="Offres par fournisseur" :data="byProvider" />
              <BarCard
                class="md:col-span-2 xl:col-span-1"
                title="Prix moyen par Go (€)"
                description="Plus la barre est basse, meilleur est le rapport qualité/prix."
                :data="pricePerGb"
                color="#3B5BA9"
            />
            <BarCard title="Prix moyen par fournisseur (€)" :data="avgPriceByProvider" color="#0B6E78" />
        </TabsContent>

        <TabsContent value="compare" class="flex flex-col gap-6">
          <TripFinder />
          <ProductTable />
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>
