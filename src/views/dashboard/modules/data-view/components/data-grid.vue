<template lang="pug">
a-card.data-grid(:bordered="false")
  template(v-if="hasHeader" #title)
    a-space(size="mini")
      svg.icon-20
        use(href="#table")
      | {{ $t('dashboard.table') }}
  a-spin(style="width: 100%")
    a-table(
      column-resizable
      size="mini"
      :data="gridData"
      :pagination="pagination"
      :scroll="{ y: '100%', x: tableWidth }"
      :bordered="{ headerCell: true }"
    )
      template(#empty)
        EmptyStatus
      template(#columns)
        template(v-for="column in gridColumns" :key="column.title")
          template(v-if="timeColumnNames.includes(column.title)")
            a-table-column(
              :width="getColumnWidth(column)"
              :data-index="timeColumnFormatMap[column.dataIndex] ? `${column.dataIndex}${formatSuffix}` : column.dataIndex"
            )
              template(#title)
                a-tooltip(
                  placement="top"
                  :content="timeColumnFormatMap[column.dataIndex] ? $t('dashboard.showTimestamp') : $t('dashboard.formatTimestamp')"
                )
                  a-space(
                    size="mini"
                    :style="{ cursor: 'pointer' }"
                    @click="() => handleFormatTimeColumn(column.dataIndex, column.dataType)"
                  )
                    svg.icon-12
                      use(href="#time-index")
                    | {{ column.title }}
          template(v-else)
            a-table-column(
              :tooltip="column.tooltip"
              :title="column.title"
              :data-index="column.dataIndex"
              :ellipsis="column.ellipsis"
              :width="getColumnWidth(column)"
            )
              template(#cell="{ record }")
                | {{ record[column.dataIndex] }}
</template>

<script lang="ts" setup>
  import { dateTypes, numberTypes } from '@/views/dashboard/config'
  import type { ResultType, SchemaType } from '@/store/modules/code-run/types'
  import { dateFormatter } from '@/utils'

  const props = withDefaults(
    defineProps<{
      data: ResultType
      hasHeader?: boolean
    }>(),
    {
      data: () => {
        return {} as ResultType
      },
      hasHeader: true,
    }
  )

  const timeColumnWidth = 140

  const MIN_COLUMN_WIDTHS = {
    timestamp: timeColumnWidth,
    boolean: 80,
  }

  const pagination = ref({
    'total': props.data?.records.rows.length,
    'show-page-size': true,
    'show-total': true,
    'show-jumper': true,
  })

  // replace '.' with '-' to make it a valid data-index
  // useful when '.' is used in column name, such as `SELECT 1.1`, `SELECT 1 AS a.b`
  function columnNameToDataIndex(columnName: string) {
    return columnName.replace(/\./gi, '-')
  }

  const timeColumnNames = computed(() => {
    const { schema } = props.data.records
    if (!schema) return []
    return props.data.records.schema.column_schemas
      .filter((column: SchemaType) => dateTypes.includes(column.data_type))
      .map((column: SchemaType) => column.name)
  })

  const gridColumns = computed(() => {
    const { schema } = props.data.records
    if (!schema) return []

    // use sort to make time columns display on the left first
    return schema.column_schemas
      .map((column: SchemaType) => {
        return {
          title: column.name,
          dataIndex: columnNameToDataIndex(column.name),
          dataType: column.data_type,
          ellipsis: true,
          tooltip: { 'content-class': 'cell-data-tooltip', 'position': 'tl' },
        }
      })
      .sort((a: any, b: any) => {
        return +timeColumnNames.value.includes(b.title) - +timeColumnNames.value.includes(a.title)
      })
  })

  // use ref to make it mutable
  const gridData = computed(() => {
    return props.data.records.rows.map((row: any) => {
      const tempRow: any = {}
      row.forEach((item: any, index: number) => {
        const columnName = columnNameToDataIndex(props.data.records.schema.column_schemas[index].name)
        const type = props.data.records.schema.column_schemas[index].data_type
        // If item is a big number (as string), convert it to Number for table to show
        if (numberTypes.includes(type) && typeof item === 'string') {
          item = Number(item)
        }
        tempRow[columnName] = item
      })
      return tempRow
    })
  })

  const calculateTextWidth = (text) => {
    if (!text) return 0

    const charWidths = {
      default: 7.2, // average character width
      narrow: 5.4, // narrow characters: i, l, j, t, f, r
      wide: 10.8, // m, w, etc.
      uppercase: 9, // A-Z
    }

    let width = 0
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      if (char.match(/[A-Z]/)) {
        width += charWidths.uppercase
      } else if (char.match(/[iljtfr]/)) {
        width += charWidths.narrow
      } else if (char.match(/[mw]/)) {
        width += charWidths.wide
      } else {
        width += charWidths.default
      }
    }
    const PADDING = 16 * 2
    return Math.ceil(width) + PADDING
  }

  const getColumnWidth = (column) => {
    const titleWidth = calculateTextWidth(column.title)

    if (timeColumnNames.value.includes(column.title)) {
      return Math.max(titleWidth, MIN_COLUMN_WIDTHS.timestamp)
    }
    if (column.dataType && column.dataType.toLowerCase() === 'boolean') {
      return Math.max(titleWidth, MIN_COLUMN_WIDTHS.boolean)
    }

    return Math.max(titleWidth, 80)
  }

  const tableWidth = computed(() => {
    if (!gridColumns.value.length) return '100%'

    const calculatedWidth = gridColumns.value.reduce((total, column) => total + getColumnWidth(column), 0)

    return `${calculatedWidth}px`
  })

  /**
   * use an extra state to store which time column is formatted
   * key is data-index instead of column name
   */
  const timeColumnFormatMap = ref(
    Object.fromEntries(
      timeColumnNames.value.map((columnName: string) => {
        return [columnNameToDataIndex(columnName), false]
      })
    )
  )

  const formatSuffix = '--FORMATTED'

  const handleFormatTimeColumn = (dataIndex: string, dataType: string) => {
    timeColumnFormatMap.value[dataIndex] = !timeColumnFormatMap.value[dataIndex]
    // calculate formatted time data on first access
    if (gridData.value.length && !gridData.value[0][`${dataIndex}${formatSuffix}`]) {
      gridData.value.forEach((row: any) => {
        row[`${dataIndex}${formatSuffix}`] = dateFormatter(dataType, row[dataIndex])
      })
    }
  }

  onUpdated(() => {
    pagination.value.total = props.data?.records.rows.length
  })
</script>

<style lang="less" scoped>
  .cell-data {
    white-space: pre-wrap;
    margin-bottom: 0;
    color: var(--small-font-color);
  }
  :deep(.arco-typography-operation-expand) {
    color: var(--brand-color);
    display: flex;
    span {
      width: 100%;
    }
    &:hover {
      color: var(--hover-brand-color);
    }
  }
</style>
