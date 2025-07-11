<template lang="pug">
BaseInput(:config="config")
  template(#selector="{ config }")
    a-space(:size="15")
      .select-item
        span.label Table
        a-select(
          v-model="tableForPipeline"
          size="small"
          allow-search
          allow-create
          :options="tableOptions"
          :loading="tableLoading"
          :style="{ minWidth: '140px' }"
          :trigger-props="{ autoFitPopupMinWidth: true }"
        )
      .select-item
        span.label Pipeline
        a-select(
          v-model="pipelineName"
          size="small"
          allow-search
          :options="pipelineOptions"
          :loading="pipelineLoading"
          :style="{ minWidth: '140px' }"
          :trigger-props="{ autoFitPopupMinWidth: true }"
        )
      .select-item
        span.label Format
        a-select(v-model="contentType" size="small" :style="{ width: '110px' }")
          a-option(value="text/plain") Plain Text
          a-option(value="application/json") JSON
          a-option(value="application/x-ndjson") NDJSON
</template>

<script lang="ts" setup>
  const ingestStore = useIngestStore()
  const dataBaseStore = useDataBaseStore()
  const route = useRoute()
  const { pipelineName, tableForPipeline, contentType, pipelineOptions, pipelineLoading } = storeToRefs(ingestStore)

  const tableOptions = computed(() => {
    return dataBaseStore.originTablesTree.map((table) => ({
      label: table.title,
      value: table.title,
    }))
  })

  const tableLoading = computed(() => dataBaseStore.tablesLoading)

  onActivated(async () => {
    if (route.query.pipeline) {
      pipelineName.value = route.query.pipeline as string
    }
    await ingestStore.fetchPipelines()

    if (pipelineOptions.value.length > 0 && !pipelineName.value) {
      pipelineName.value = pipelineOptions.value[0].value
    }
  })

  const { getLogIngestionInputConfig } = useIngest()
  const config = getLogIngestionInputConfig(pipelineName, tableForPipeline, contentType)
</script>

<style lang="less" scoped>
  .select-item {
    display: flex;
    align-items: center;

    .label {
      margin-right: 6px;
      white-space: nowrap;
    }
  }
</style>
