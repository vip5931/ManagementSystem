<template>
  <div>
    <a-card title="数据录入" :bordered="false">
      <template #extra>
        <a-button type="primary">新增数据</a-button>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
      >
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'action'">
            <div class="space-x-2">
              <a-button type="link">编辑</a-button>
              <a-button type="link" danger>删除</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'

interface DataItem {
  key: string
  name: string
  value: number
  date: string
  status: string
}

const columns: TableColumnsType = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '数值',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
]

const loading = ref(false)
const dataSource = ref<DataItem[]>([])
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
</script> 
