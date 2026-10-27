<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig,
} from '@/components/ui/chart'

interface Item { label: string; value: number }

const props = withDefaults(
  defineProps<{ title: string; description?: string; data: Item[]; color?: string }>(),
  { color: '#0B6E78' },
)

const config = computed<ChartConfig>(() => ({
  value: { label: props.title, color: props.color },
}))

// Axe X numérique (0, 1, 2…) : on affiche le libellé correspondant
const chartData = computed(() =>
  props.data.map((d, i) => ({ ...d, i: props.horizontal ? props.data.length - 1 - i : i })),
)

const tickFormat = (v: number) => {
  if (!Number.isInteger(v)) return ''
  const idx = props.horizontal ? props.data.length - 1 - v : v
  return props.data[idx]?.label ?? ''
}

type Row = (typeof chartData.value)[number]

const tooltip = computed(() =>
  componentToString(config.value, ChartTooltipContent, { labelKey: 'label' }),
)

// Les barres horizontales grandissent avec le nombre de lignes
const height = computed(() =>
  props.horizontal ? Math.max(180, props.data.length * 40 + 40) : 224,
)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
        <ChartContainer :config="config" class="w-full" :style="{ height: height + 'px' }">
          <VisXYContainer :data="chartData">
            <VisGroupedBar
              :x="(d: Row) => d.i"
              :y="(d: Row) => d.value"
              :color="color"
              :rounded-corners="4"
              :bar-padding="0.3"
            />
            <!-- Axe des libellés (en bas, ou à gauche en horizontal) -->
            <VisAxis
              :type="horizontal ? 'y' : 'x'"
              :num-ticks="data.length"
              :tick-format="tickFormat"
              :grid-line="false"
              :tick-line="false"
              :domain-line="false"
            />
            <!-- Axe des valeurs -->
            <VisAxis
              :type="horizontal ? 'x' : 'y'"
              :num-ticks="4"
              :tick-line="false"
              :domain-line="false"
            />
            <ChartTooltip />
            <ChartCrosshair :template="tooltip" :color="color" />
          </VisXYContainer>
        </ChartContainer>
    </CardContent>
  </Card>
</template>
