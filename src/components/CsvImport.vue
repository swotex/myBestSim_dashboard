<script setup lang="ts">
import { ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCatalog } from '@/composables/useCatalog'

const { csvFiles, addFiles, removeFile, reset } = useCatalog()
const dragging = ref(false)

function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}
function onPick(e: Event) {
  const el = e.target as HTMLInputElement
  if (el.files) addFiles(el.files)
  el.value = ''
}
</script>

<template>
  <Card class="flex-row flex-wrap items-center gap-5 p-5">
    <!-- Zone de dépôt -->
    <label
      class="flex min-w-72 flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-zinc-400/80 p-5 text-center transition-colors focus-within:ring-2 focus-within:ring-ring"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40'"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <input type="file" accept=".csv" multiple class="sr-only" @change="onPick" />
      <Upload class="mb-1 size-5 text-muted-foreground" aria-hidden="true" />
      <span class="font-bold">Glisse un fichier CSV ici</span>
      <span class="text-sm text-muted-foreground">
        ou clique pour en ajouter un ou plusieurs
      </span>
    </label>

    <!-- Fichiers chargés -->
    <div class="flex min-w-80 flex-[2] flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Fichiers chargés ({{ csvFiles.length }})
        </span>
        <Button variant="ghost" size="sm" @click="reset">Réinitialiser</Button>
      </div>

      <ul class="flex flex-wrap max-h-30 overflow-auto gap-2">
        <li v-for="f in csvFiles" :key="f.name">
          <Badge variant="secondary" class="gap-2 py-1 pr-1 pl-3 text-sm bg-[#e6f3f4]">
            {{ f.name }}
            <span class="text-muted-foreground">· {{ f.products.length }}</span>
             <Button
              variant="ghost"
              size="icon"
              class="size-6 rounded-full text-red-900 hover:text-red-600"
              :aria-label="`Retirer ${f.name}`"
              @click="removeFile(f.name)"
            >
              <X class="size-3.5" />
            </Button>
          </Badge>
        </li>
      </ul>
    </div>
  </Card>
</template>
