<template lang="pug">
a-tabs.panel-tabs(
  type="line"
  lazy-load
  editable
  :active-key="activeTabKey"
  :animation="true"
  @tab-click="tabClick"
  @delete="deleteTab"
)
  template(#extra)
    a-popconfirm(
      content="Clear results?"
      type="warning"
      ok-text="Clear"
      cancel-text=""
      @ok="clearResults"
    )
      a-button(status="danger" size="small") {{ $t('dashboard.clear') }}
  a-tab-pane(
    v-for="(result, index) of results"
    :key="result.key"
    closable
    :title="`${$t('dashboard.result')} ${result.key - startKey + 1}`"
  )
    a-tabs.data-view-tabs(:animation="true")
      a-tab-pane(key="table" :title="$t('dashboard.table')")
        template(#title)
          a-space(:size="10")
            svg.icon-16
              use(href="#table")
            | {{ $t('dashboard.table') }}
        DataGrid(:data="result" :has-header="false")
      a-tab-pane(v-if="useDataChart(result).hasChart.value" key="chart" :title="$t('dashboard.chart')")
        template(#title)
          a-space(:size="10")
            svg.icon-16
              use(href="#chart")
            | {{ $t('dashboard.chart') }}
        DataChart(:data="result" :has-header="false")
</template>

<script lang="ts" name="DataView" setup>
  import useDataChart from '@/hooks/data-chart'
  import { useCodeRunStore } from '@/store'
  import type { ResultType } from '@/store/modules/code-run/types'

  const props = defineProps<{
    results: ResultType[]
    types: string[]
  }>()

  const { removeResult, clear } = useCodeRunStore()
  const activeTabKey = ref(props.results[0]?.key)
  const startKey = ref(props.results[0]?.key)

  const deleteTab = async (key: number) => {
    const index = props.results.findIndex((result) => result.key === key && props.types.includes(result.type))
    if (props.results.length === 1) {
      startKey.value = props.results[0].key
    }
    await removeResult(key, props.results[index].type)
    if (activeTabKey.value === key) {
      activeTabKey.value = props.results[index]?.key || props.results.slice(-1)[0].key
    }
  }

  const tabClick = (key: any) => {
    activeTabKey.value = key
  }

  const clearResults = () => {
    startKey.value = props.results[0].key
    clear(props.types)
  }

  watch(
    () => ({ ...props }),
    (value, old) => {
      if (value.results.length > old.results.length) {
        activeTabKey.value = props.results.slice(-1)[0].key
      }
    }
  )
</script>

<style lang="less">
  .data-view-tabs {
    width: 100%;
    .arco-tabs-nav::before {
      background-color: transparent;
    }
    > .arco-tabs-content > .arco-tabs-content-list > .arco-tabs-content-item {
      padding: 15px 0;
    }

    .arco-tabs-nav-tab-list {
      display: flex;
    }
  }
</style>

<style lang="less" scoped>
  .arco-btn {
    border-radius: 2px;
  }
  .arco-tabs.panel-tabs {
    .arco-tabs-content .arco-tabs-content-item {
      height: 100%;
      // TODO: better scrollbar style
      max-height: none;
    }
    :deep(> .arco-tabs-content) {
      > .arco-tabs-content-list > .arco-tabs-content-item {
        padding: 0;
        .arco-tabs-nav-ink {
          background: transparent;
        }
        .arco-tabs-nav-tab-list > :nth-child(2) {
          .arco-tabs-tab-title {
            border-left: 1px solid var(--border-color);
          }
        }
        .arco-tabs-tab {
          padding: 2px 0;
          margin: 0;
          color: var(--main-font-color);
          &:first-of-type {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
          }
          &:nth-last-of-type(2) {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 3px;
          }
          &.arco-tabs-tab-active {
            color: var(--brand-color);
            font-weight: 400;
          }
          > .arco-tabs-tab-title {
            width: 84px;
            padding-left: 10px;
            display: flex;
            font-size: 12px;
            height: 20px;
            &::before {
              border-radius: 4px;
              left: 0;
              right: 0;
              top: -6px;
              bottom: -6px;
            }
          }
        }
      }
      .arco-table.data-table .arco-table-container {
        border-radius: 0;
        border: none;
      }
      .arco-table-size-mini .arco-table-td {
        font-size: 11px;
      }
    }
    :deep(.data-view-tabs) {
      width: 100%;
      height: 100%;
      .arco-tabs-nav::before {
        background-color: transparent;
      }
      > .arco-tabs-content {
        height: calc(100% - 24px);
      }
      .arco-tabs-nav-tab-list {
        display: flex;
      }
      > .arco-tabs-content > .arco-tabs-content-list > .arco-tabs-content-item {
        padding: 0;
      }
      .arco-card.data-grid {
        height: 100%;
        padding: 0 8px;
        > .arco-card-body {
          height: 100%;
          > .arco-spin {
            height: 100%;
            .arco-table-pagination {
              margin: 0;
              .arco-pagination-total {
                font-size: 11px;
              }
              .arco-pagination-item {
                font-size: 11px;
              }
              .arco-pagination-options .arco-select-view-value {
                font-size: 11px;
              }
              .arco-pagination-jumper > span {
                font-size: 12px;
              }
              .arco-input-wrapper .arco-input.arco-input-size-medium {
                padding-top: 2px;
                padding-bottom: 1px;
                font-size: 11px;
              }
            }
          }
        }
      }
    }
  }
</style>
