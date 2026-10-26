<script setup lang="ts">
import { ref } from 'vue'
import { loadPreloaded } from '@/lib/products'
import CsvImport from './components/CsvImport.vue';
import { useCatalog } from './composables/useCatalog';
import KpiGrid from './components/KpiGrid.vue';
import { useStats } from './composables/useStats';
import BarCard from './components/BarCard.vue';

// const products = ref(loadPreloaded())
const { products } = useCatalog()
const { byProvider, priceBuckets, pricePerGb } = useStats()
</script>

<template>
  <div class="min-h-screen bg-muted/40 px-4 py-6 sm:px-6 sm:py-8">
    <main class="mx-auto flex max-w-6xl flex-col gap-6">

      <!-- En-tête -->
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">Catalogue eSIM</h1>
          <p class="text-muted-foreground">
            Vue d'ensemble des produits importés depuis les fichiers CSV des fournisseurs.
          </p>
        </div>
        <Button>Exporter le rapport</Button>
      </header>

      <!-- 1. Import CSV -->
      <CsvImport />

      <!-- 2. KPI : 5 tuiles qui passent à la ligne toutes seules -->
      <KpiGrid class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4" />

      <!-- 3. Graphiques : 1 colonne mobile, 2 tablette, 3 desktop -->
      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BarCard title="Cartes par fournisseur" :data="byProvider" />
            <BarCard title="Répartition des prix" :data="priceBuckets" color="#E28A2B" />
            <BarCard
              class="md:col-span-2 xl:col-span-1"
              title="Prix moyen par Go (€)"
              description="Plus la barre est basse, meilleur est le rapport qualité/prix."
              :data="pricePerGb"
              color="#3B5BA9"
            />
      </section>

      <!-- 4. Mon voyage (bloc sombre) -->
      <TripFinder />

      <!-- 5. Filtres + tableau -->
      <ProductTable />

    </main>
  </div>
</template>
