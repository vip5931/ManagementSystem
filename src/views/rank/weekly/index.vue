<template>
  <div>
    <a-card title="信息录入" :bordered="false">
      <template #extra>
        <a-button type="primary">新增信息</a-button>
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
import { ref, onMounted } from "vue";
import type { TableColumnsType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { getRankList } from '@/api/rank';

interface DataItem {
  key: string;
  title: string;
  content: string;
  week: string;
  status: string;
}

const columns: TableColumnsType = [
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
  },
  {
    title: "周次",
    dataIndex: "week",
    key: "week",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "操作",
    key: "action",
    width: 200,
  },
];

const loading = ref(false);
const dataSource = ref<DataItem[]>([]);
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
});

const loadData = async () => {
  try {
    loading.value = true;
    const data = await getRankList();
    dataSource.value = data;
    pagination.value.total = data.length;
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
