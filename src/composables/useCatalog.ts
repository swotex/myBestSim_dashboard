import { ref, computed } from 'vue'
import { loadPreloaded, parseCsv, type CsvFile } from '@/lib/products'

// Défini hors de la fonction : l'état est partagé par tous les composants
const csvFiles = ref<CsvFile[]>(loadPreloaded())

export function useCatalog() {
  const products = computed(() => csvFiles.value.flatMap((f) => f.products))

  async function addFiles(list: FileList | File[]) {
    for (const file of Array.from(list)) {
      if (!file.name.toLowerCase().endsWith('.csv')) continue
      const parsed: CsvFile = {
        name: file.name,
        products: parseCsv(await file.text()),
        preloaded: false,
      }
      const i = csvFiles.value.findIndex((f) => f.name === file.name)
      if (i >= 0) csvFiles.value[i] = parsed // même nom : on remplace
      else csvFiles.value.push(parsed)
    }
  }

  function removeFile(name: string) {
    csvFiles.value = csvFiles.value.filter((f) => f.name !== name)
  }

  function reset() {
    csvFiles.value = loadPreloaded()
  }

  return { csvFiles, products, addFiles, removeFile, reset }
}
