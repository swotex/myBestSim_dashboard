<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { loadPreloaded } from '@/lib/products'
import CsvImport from './components/CsvImport.vue';
import { useCatalog } from './composables/useCatalog';
import KpiGrid from './components/KpiGrid.vue';
import { useStats } from './composables/useStats';
import BarCard from './components/BarCard.vue';
import TripFinder from './components/TripFinder.vue';
import ProductTable from './components/ProductTable.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Button from './components/ui/button/Button.vue';
import ProviderTable from './components/ProviderTable.vue';
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'

// const products = ref(loadPreloaded())
const { products } = useCatalog()
const { byProvider, priceBuckets, pricePerGb, byValidity, avgPriceByProvider } = useStats()

const tab = ref('stats')
const today = new Date().toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const exporting = ref(false)

const reportEl = ref<HTMLElement | null>(null)

async function exportReport() {
  if (!reportEl.value) return
  exporting.value = true
  try {
    tab.value = 'stats' // l'onglet Comparateur disparaît de la page
    await nextTick()
    await new Promise((r) => setTimeout(r, 600)) // laisse les graphiques se dessiner

    const canvas = await html2canvas(reportEl.value, {
      scale: 2,
      backgroundColor: '#f4f6f8',
      // On affiche la date uniquement dans la copie capturée
      onclone: (doc) => {
        const d = doc.querySelector<HTMLElement>('[data-export-date]')
        if (d) d.style.display = 'block'
      },
    })

    // Une seule page, à la hauteur de la capture : rien n'est coupé
    const w = 210
    const h = (canvas.height * w) / canvas.width
    const pdf = new jsPDF({ unit: 'mm', format: [w, h], orientation: h > w ? 'p' : 'l' })
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, h)
    pdf.save(`Rapport-eSIM-${new Date().toISOString().slice(0, 10)}.pdf`)
  } catch (e) {
    console.error('Export PDF :', e)
    alert('Export impossible : ' + (e instanceof Error ? e.message : e))
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-muted/40 px-4 py-6 sm:px-6 sm:py-8 print:bg-white print:p-0">
    <main ref="reportEl" class="mx-auto flex max-w-6xl flex-col gap-6">
      <!-- En-tête -->
        <header class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-col gap-1.5">
            <h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">Catalogue eSIM</h1>
            <p class="text-muted-foreground">
                Vue d'ensemble des produits importés depuis les fichiers CSV des fournisseurs.
            </p>
            <!-- la date n'apparaît qu'à l'impression -->
            <p data-export-date class="hidden text-sm font-semibold print:block">Rapport généré le {{ today }}</p>
            </div>
            <Button data-html2canvas-ignore :disabled="exporting" class="bg-[#0b6d78] hover:bg-[#0b6d78]/90 p-5" @click="exportReport">{{ exporting ? 'Export en cours…' : 'Exporter le rapport' }}</Button>
        </header>

      <CsvImport data-html2canvas-ignore />

      <Tabs v-model="tab" class="gap-6">
        <TabsList data-html2canvas-ignore class="h-11">
          <TabsTrigger value="stats" class="px-5">Statistiques</TabsTrigger>
          <TabsTrigger value="compare" class="px-5">Comparateur</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" class="flex flex-col gap-6">
          <KpiGrid data-report-block class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4" />
          <section data-report-block class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            <BarCard title="Répartition des prix" :data="priceBuckets" color="#E28A2B" />
            <BarCard title="Répartition par durée de validité" :data="byValidity" color="#7A4FB5" />
            <!-- <BarCard horizontal title="Offres par fournisseur" :data="byProvider" />
            <BarCard horizontal title="Prix moyen par fournisseur (€)" :data="avgPriceByProvider" />
            <BarCard horizontal title="Prix moyen par Go (€)" :data="pricePerGb" color="#3B5BA9" description="Plus la barre est basse, meilleur est le rapport qualité/prix." />
            <BarCard title="Répartition des prix" :data="priceBuckets" color="#E28A2B" />
            <BarCard title="Répartition par durée de validité" :data="byValidity" color="#7A4FB5" /> -->
            <!-- <BarCard horizontal title="Offres par pays (top 8)" :data="topCountries" color="#2F855A" /> -->
          </section>
               <!-- <BarCard title="Offres par fournisseur" :data="byProvider" />
              <BarCard
                class="md:col-span-2 xl:col-span-1"
                title="Prix moyen par Go (€)"
                description="Plus la barre est basse, meilleur est le rapport qualité/prix."
                :data="pricePerGb"
                color="#3B5BA9"
            />
            <BarCard title="Prix moyen par fournisseur (€)" :data="avgPriceByProvider" color="#0B6E78" /> -->
            <ProviderTable data-report-block />
        </TabsContent>

        <TabsContent value="compare" class="flex flex-col gap-6">
          <TripFinder />
          <ProductTable />
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>
