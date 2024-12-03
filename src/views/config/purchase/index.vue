<template>
  <div class="config-purchase">
    <a-card title="抽奖活动配置">
      <template #extra>
        <a-button type="primary" @click="handleAdd">新增期数</a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="periodList"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a @click="handleConfig(record)">奖品配置</a>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="addVisible"
      title="新增期数"
      ok-text="确定"
      cancel-text="取消"
      :confirm-loading="confirmLoading"
      @ok="handleAddSubmit"
      @cancel="handleModalCancel"
      :maskClosable="false"
    >
      <a-form :model="addForm">
        <a-form-item label="期数名称" required>
          <a-input v-model:value="addForm.name" placeholder="请输入期数名称" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="configVisible"
      title="奖品配置"
      ok-text="确定"
      cancel-text="取消"
      :confirm-loading="configLoading"
      @ok="handleConfigSubmit"
      @cancel="() => configVisible = false"
      width="800px"
      :body-style="{ padding: '16px 0' }"
    >
      <div class="prize-config-dialog">
        <div class="prize-grid">
          <div v-for="prize in prizeList" :key="prize.id" class="prize-item">
            <div class="prize-image">
              <div class="upload-trigger" @click="triggerUpload(prize.id)">
                <img
                  v-if="prize.imageUrl"
                  :src="getPreviewUrl(prize.imageUrl)"
                  alt="奖品图片"
                  class="prize-img"
                />
                <div v-else class="upload-placeholder">
                  <plus-outlined />
                </div>
              </div>
              <input
                :ref="(el) => { if (el) fileInputRefs[prize.id] = el }"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                style="display: none"
                @change="(e) => handleUpload(e, prize)"
              />
            </div>
            <div class="prize-config">
              <a-input-number
                v-model:value="prize.probability"
                :min="0"
                :max="100"
                :precision="2"
                :controls="false"
                addon-after="%"
                size="small"
              />
              <!-- 保底奖品配置 -->
              <template v-if="prize.prizeType === PrizeType.Guaranteed">
                <a-input-number
                  v-model:value="prize.guaranteedCount"
                  :min="1"
                  :controls="false"
                  addon-after="次"
                  placeholder="保底次数"
                  size="small"
                />
              </template>
              <!-- 兑换奖品配置 -->
              <template v-if="prize.prizeType === PrizeType.Exchange">
                <a-input-number
                  v-model:value="prize.exchangeMaterialCount"
                  :min="1"
                  :controls="false"
                  addon-after="个"
                  placeholder="所需材料"
                  size="small"
                />
              </template>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <div class="total-probability">总概率：{{ totalProbability }}%</div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue/es'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { PeriodRecord, PrizeRecord } from '@/types/lottery'
import { PrizeType } from '@/types/lottery'
import { getPeriods, createPeriod, getPrizes, savePrizes } from '@/api/lottery'
import { uploadFile } from '@/api/upload'

// 期数列表
const periodList = ref<PeriodRecord[]>([])
const loading = ref(false)
const confirmLoading = ref(false)

// 奖品配置相关
const configVisible = ref(false)
const configLoading = ref(false)
const currentPeriod = ref<PeriodRecord | null>(null)
const prizeList = ref<PrizeRecord[]>([])
const fileInputRefs = ref<Record<number, HTMLInputElement>>({})

// 计算总概率
const totalProbability = computed(() => {
  return Number(
    prizeList.value
      .reduce((sum: number, prize: PrizeRecord) => sum + Number(prize.probability || 0), 0)
      .toFixed(2)
  )
})

// 表格列配置
const columns = [
  {
    title: '期数',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center',
  }
]

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取期数列表
const fetchPeriods = async () => {
  try {
    loading.value = true
    const res = await getPeriods()
    periodList.value = res
  } catch (error) {
    message.error('获取期数列表失败')
  } finally {
    loading.value = false
  }
}

// 新增相关
const addVisible = ref(false)
const addForm = ref({
  name: '',
})

const handleAdd = () => {
  addForm.value.name = `第${periodList.value.length + 1}期`
  addVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addForm.value.name) {
    message.error('请输入期数名称')
    return
  }

  try {
    confirmLoading.value = true
    const res = await createPeriod({
      name: addForm.value.name,
      status: true
    })
    
    message.success('新增成功')
    addVisible.value = false
    fetchPeriods()
  } catch (error) {
    message.error('新增失败')
  } finally {
    confirmLoading.value = false
  }
}

const handleModalCancel = () => {
  addVisible.value = false
}

// 奖品配置
const handleConfig = async (record: PeriodRecord) => {
  currentPeriod.value = record
  try {
    const res = await getPrizes(record.id)
    prizeList.value = res.prizes || []
    if (prizeList.value.length === 0) {
      // 如果没有配置,使用默认配置
      prizeList.value = Array.from({ length: 16 }, (_, index) => ({
        id: index + 1,
        prizeIndex: index + 1,
        prizeType:
          index < 8
            ? PrizeType.Normal
            : index < 12
            ? PrizeType.Guaranteed
            : PrizeType.Exchange,
        probability: 0,
        quantity: index < 8 ? -1 : 1,
        imageUrl: '',
      }))
    }
    configVisible.value = true
  } catch (error) {
    message.error('获取奖品配置失败')
  }
}

const handleConfigSubmit = async () => {
  // 验证总概率
  if (Math.abs(totalProbability.value - 100) > 0.01) {
    message.error('概率总和必须为100%')
    return
  }

  // 验证必填字段
  for (const prize of prizeList.value) {
    if (!prize.imageUrl) {
      message.error('请上传所有奖品图片')
      return
    }
    if (prize.prizeType === PrizeType.Guaranteed && !prize.guaranteedCount) {
      message.error('请设置保底奖品的保底次数')
      return
    }
    if (prize.prizeType === PrizeType.Exchange && !prize.exchangeMaterialCount) {
      message.error('请设置兑换奖品的材料数量')
      return
    }
  }

  try {
    configLoading.value = true
    const res = await savePrizes(currentPeriod.value!.id, prizeList.value)
    if (res.code === 0) {
      message.success('保存成功')
      configVisible.value = false
    }
  } catch (error) {
    message.error('保存失败')
  } finally {
    configLoading.value = false
  }
}

// 处理图片上传
const handleUpload = async (e: Event, prize: PrizeRecord) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    message.error('只支持 jpg、jpeg、png、gif 格式的图片')
    return
  }

  // 验证文件大小
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    message.error('图片大小不能超过10MB')
    return
  }

  try {
    const response = await uploadFile(file)
    if (response && response.url) {
      prize.imageUrl = response.url
      message.success('上传成功')
    } else {
      throw new Error('上传失败')
    }
  } catch (error) {
    message.error('上传失败')
    input.value = ''
  }
}

// 预览图片URL处理
const getPreviewUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `/${path.replace(/^\//, '')}`
}

// 触发文件选择
const triggerUpload = (prizeId: number) => {
  fileInputRefs.value[prizeId]?.click()
}

// 初始化
fetchPeriods()
</script>

<style scoped>
.config-purchase {
  padding: 24px;
}

.prize-config-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.prize-grid {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  gap: 12px;
  padding: 16px;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  margin: 0 16px;
}

.prize-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 80px;
}

.prize-image {
  width: 80px;
  height: 80px;
}

.upload-trigger {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
}

.upload-trigger:hover {
  border-color: #1890ff;
}

.upload-placeholder {
  font-size: 20px;
  color: #999;
}

.prize-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prize-config {
  width: 80px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prize-config :deep(.ant-input-number) {
  width: 100%;
}

.prize-config :deep(.ant-input-number-group-wrapper) {
  width: 100%;
}

.prize-config :deep(.ant-input-number-input) {
  height: 24px;
  padding: 0 4px;
  font-size: 12px;
  text-align: center;
}

/* 隐藏输入框的上下箭头 */
.prize-config :deep(.ant-input-number-input::-webkit-inner-spin-button),
.prize-config :deep(.ant-input-number-input::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.prize-config :deep(.ant-input-number-input[type="number"]) {
  -moz-appearance: textfield;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

.total-probability {
  font-size: 14px;
  font-weight: 500;
  color: #1890ff;
}
</style>
