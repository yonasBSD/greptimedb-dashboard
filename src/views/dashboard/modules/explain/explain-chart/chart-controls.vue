<template lang="pug">
.chart-controls
  .node-selector
    span.node-label Nodes:
    .node-buttons
      a-button(
        v-for="node in availableNodes"
        :key="`${inputPrefix}-node-${node}`"
        size="mini"
        :type="activeNodeIndex === node ? 'primary' : 'outline'"
        @click="onNodeSelect(node)"
      ) {{ node }}
  .highlight-controls
    span.control-label Highlight
    a-radio-group(
      v-model="localHighlightType"
      type="button"
      size="mini"
      :id="`${inputPrefix}-highlight`"
    )
      a-radio(value="NONE") None
      a-radio(value="ROWS") Rows
      a-radio(value="DURATION") Duration
  a-select(
    v-model="localSelectedMetric"
    size="mini"
    style="width: fit-content; margin-left: 16px; margin-right: 8px"
    placeholder="Select metric"
    allow-clear
    :id="`${inputPrefix}-metric`"
    :trigger-props="{ autoFitPopupMinWidth: true }"
  )
    a-option(v-for="metric in availableMetrics" :key="metric.value" :value="metric.value") {{ metric.label }}
  a-button(type="outline" size="mini" @click="onToggleMetricsExpanded")
    template(#icon)
      icon-expand(v-if="!metricsExpanded")
      icon-shrink(v-else)
    | {{ metricsExpanded ? 'Collapse' : 'Expand' }}
</template>

<script lang="ts" setup>
  import { ref, watch, computed } from 'vue'
  import { IconExpand, IconShrink } from '@arco-design/web-vue/es/icon'

  const props = defineProps<{
    availableNodes: number[]
    activeNodeIndex: number | null
    highlightType: string
    selectedMetric: string
    metricsExpanded: boolean
    maxRows: number
    maxDuration: number
    availableMetrics: Array<string>
    stageIndex: number
  }>()

  const emit = defineEmits<{
    (e: 'update:highlightType', value: string): void
    (e: 'update:selectedMetric', value: string): void
    (e: 'update:metricsExpanded', value: boolean): void
    (e: 'nodeSelected', nodeIndex: number): void
  }>()
  const inputPrefix = computed(() => `chart-control-stage-${props.stageIndex}`)

  const localHighlightType = ref(props.highlightType)
  const localSelectedMetric = ref(props.selectedMetric)

  watch(
    () => props.highlightType,
    (val) => {
      localHighlightType.value = val
    }
  )
  watch(
    () => props.selectedMetric,
    (val) => {
      localSelectedMetric.value = val
    }
  )

  watch(localHighlightType, (val) => emit('update:highlightType', val))
  watch(localSelectedMetric, (val) => emit('update:selectedMetric', val))

  const onNodeSelect = (nodeIndex: number) => {
    emit('nodeSelected', nodeIndex)
  }

  const onToggleMetricsExpanded = () => {
    emit('update:metricsExpanded', !props.metricsExpanded)
  }
</script>

<style lang="less" scoped>
  .chart-controls {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card-bg-color);

    .node-selector {
      display: flex;
      align-items: center;
      margin-right: 16px;

      .node-label {
        margin-right: 8px;
        font-size: 13px;
        color: var(--small-font-color);
        font-family: 'Gilroy';
      }

      .node-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        max-width: 300px;
      }
    }

    .highlight-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      margin-right: 16px;

      .control-label {
        font-size: 13px;
        color: var(--small-font-color);
      }
    }

    .flex-spacer {
      flex: 1;
    }
  }

  .arco-radio-button.arco-radio-checked {
    color: var(--brand-color);
  }
</style>
