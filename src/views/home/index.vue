<template>
  <div class="home-container">
    <!-- 顶部统计卡片 -->
    <div class="statistics-row">
      <a-card class="stat-card">
        <Statistic
          title="今日战力增长"
          :value="statistics.todayPower"
          :precision="0"
          suffix="点"
          class="statistic-card"
        >
          <template #prefix>
            <ThunderboltOutlined />
          </template>
        </Statistic>
      </a-card>

      <a-card class="stat-card">
        <Statistic
          title="本周战力增长"
          :value="statistics.weekPower"
          :precision="0"
          suffix="点"
          class="statistic-card"
        >
          <template #prefix>
            <RiseOutlined />
          </template>
        </Statistic>
      </a-card>

      <a-card class="stat-card">
        <Statistic
          title="服务器平均战力"
          :value="statistics.avgPower"
          :precision="0"
          suffix="点"
          class="statistic-card"
        >
          <template #prefix>
            <BarChartOutlined />
          </template>
        </Statistic>
      </a-card>

      <a-card class="stat-card">
        <Statistic
          title="总角色数"
          :value="statistics.totalCount"
          :precision="0"
          class="statistic-card"
        >
          <template #prefix>
            <TeamOutlined />
          </template>
        </Statistic>
      </a-card>
    </div>

    <!-- 数据分析区域 -->
    <a-row :gutter="16" class="mb-6">
      <a-col :span="24">
        <a-card title="职业分布" :bordered="false">
          <div ref="professionChartRef" style="height: 400px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 战力分布和趋势图 -->
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="战力分布" :bordered="false">
          <div ref="powerChartRef" style="height: 400px"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="各服战力趋势" :bordered="false">
          <div ref="trendChartRef" style="height: 400px"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { Statistic } from "ant-design-vue";
import {
  ThunderboltOutlined,
  RiseOutlined,
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import { getRankList } from "@/api/rank";
import { message } from "ant-design-vue";

interface RankItem {
  id: number;
  serverName: string;
  roleName: string;
  combatPower: number;
  profession: string;
  rankNo: number;
}

interface Statistics {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  todayPower: number;
  weekPower: number;
  avgPower: number;
}

// 状态定义
const activeTab = ref("server");
const loading = ref(false);
const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

const statistics = ref<Statistics>({
  todayCount: 0,
  weekCount: 0,
  monthCount: 0,
  totalCount: 0,
  todayPower: 0,
  weekPower: 0,
  avgPower: 0,
});

const rankList = ref({
  server: [] as RankItem[],
  profession: [] as RankItem[],
});

// 获取排名颜色
const getRankColor = (index: number) => {
  const colors = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae"];
  return colors[index] || "#8c8c8c";
};

// 职业颜色映射
const professionColors = {
  乘风: "#1890ff", // 蓝色
  御剑: "#52c41a", // 绿色
  控火: "#f5222d", // 红色
  奇门: "#722ed1", // 紫色
  幽冥: "#262626", // 深灰色
  掌电: "#faad14", // 金色
  天君: "#eb2f96", // 粉色
  乾坤: "#13c2c2", // 青色
  金刚: "#fa8c16", // 橙色
  罗刹: "#cf1322", // 深红色
  妙音: "#2f54eb", // 靛蓝色
};

// 获取职业颜色
const getProfessionColor = (profession: string) => {
  return professionColors[profession] || "#8c8c8c";
};

// 添加缺失的 ref 定义
const professionChartRef = ref<HTMLElement>();
const powerChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();

// 修改图表实例的声明
let professionChart: echarts.ECharts | undefined;
let powerChart: echarts.ECharts | undefined;
let trendChart: echarts.ECharts | undefined;

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["日录入量", "周录入量"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "日录入量",
        type: "line",
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: "周录入量",
        type: "line",
        data: [220, 182, 191, 234, 290, 330, 310],
      },
    ],
  };

  chart.setOption(option);
};

// 初始化职业分布图表
const initProfessionChart = () => {
  if (!professionChartRef.value) return;

  professionChart = echarts.init(professionChartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}人 ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      left: "center",
      itemWidth: 25,
      itemHeight: 14,
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "60%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c}人",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: [
          {
            value: 0,
            name: "乘风",
            itemStyle: { color: professionColors["乘风"] },
          },
          {
            value: 0,
            name: "御剑",
            itemStyle: { color: professionColors["御剑"] },
          },
          {
            value: 0,
            name: "控火",
            itemStyle: { color: professionColors["控火"] },
          },
          {
            value: 0,
            name: "奇门",
            itemStyle: { color: professionColors["奇门"] },
          },
          {
            value: 0,
            name: "幽冥",
            itemStyle: { color: professionColors["幽冥"] },
          },
          {
            value: 0,
            name: "掌电",
            itemStyle: { color: professionColors["掌电"] },
          },
          {
            value: 0,
            name: "天君",
            itemStyle: { color: professionColors["天君"] },
          },
          {
            value: 0,
            name: "乾坤",
            itemStyle: { color: professionColors["乾坤"] },
          },
          {
            value: 0,
            name: "金刚",
            itemStyle: { color: professionColors["金刚"] },
          },
          {
            value: 0,
            name: "罗刹",
            itemStyle: { color: professionColors["罗刹"] },
          },
          {
            value: 0,
            name: "妙音",
            itemStyle: { color: professionColors["妙音"] },
          },
        ],
      },
    ],
  };

  professionChart.setOption(option);
};

// 初始化战力分布图表
const initPowerChart = () => {
  if (!powerChartRef.value) return;

  powerChart = echarts.init(powerChartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: "{b}: {c}人",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: [
        "1000万以下",
        "1000-2000万",
        "2000-3000万",
        "3000-4000万",
        "4000-5000万",
        "5000万以上",
      ],
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      name: "人数",
    },
    series: [
      {
        type: "bar",
        data: [0, 0, 0, 0, 0, 0],
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: function (params: any) {
            const colors = [
              "#91cc75",
              "#fac858",
              "#ee6666",
              "#73c0de",
              "#3ba272",
              "#fc8452",
            ];
            return colors[params.dataIndex];
          },
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}人",
          fontSize: 12,
          color: "#666",
        },
        barWidth: "40%", // 控制柱子宽度
      },
    ],
  };

  powerChart.setOption(option);
};

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return;

  trendChart = echarts.init(trendChartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>
                总战力: ${(data.value / 10000).toFixed(1)}万<br/>
                角色数: ${data.count}人`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: [],
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      name: "总战力",
      axisLabel: {
        formatter: (value: number) => {
          return (value / 10000).toFixed(0) + "万";
        },
      },
    },
    series: [
      {
        type: "bar",
        barWidth: "40%",
        label: {
          show: true,
          position: "top",
          formatter: (params: any) => {
            return (params.value / 10000).toFixed(0) + "万";
          },
        },
        itemStyle: {
          color: function (params: any) {
            const colors = [
              "#91cc75",
              "#fac858",
              "#ee6666",
              "#73c0de",
              "#3ba272",
              "#fc8452",
            ];
            return colors[params.dataIndex % colors.length];
          },
        },
      },
    ],
  };

  trendChart.setOption(option);
};

// 获取排行榜数据
const fetchRankData = async () => {
  try {
    loading.value = true;
    const result = await getRankList();

    // 处理数据
    const data = result.data;

    // 计算统计数据
    const totalPower = data.reduce((sum, item) => sum + item.combatPower, 0);
    const avgPower = Math.floor(totalPower / (data.length || 1));
    const maxPower = Math.max(...data.map((item) => item.combatPower));

    // 更新统计数据
    statistics.value = {
      todayCount: data.length,
      weekCount: data.length,
      monthCount: data.length,
      totalCount: data.length,
      todayPower: maxPower,
      weekPower: totalPower,
      avgPower: avgPower,
    };

    // 更新排行榜数据
    rankList.value = {
      server: data.sort((a, b) => b.combatPower - a.combatPower).slice(0, 10),
      profession: Object.values(
        data.reduce((acc, curr) => {
          if (
            !acc[curr.profession] ||
            acc[curr.profession].combatPower < curr.combatPower
          ) {
            acc[curr.profession] = curr;
          }
          return acc;
        }, {} as Record<string, (typeof data)[0]>)
      ),
    };

    // 处理职业分布数据
    const professionData = data.reduce((acc, curr) => {
      acc[curr.profession] = (acc[curr.profession] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 更新职业分布图表
    if (professionChart) {
      professionChart.setOption({
        series: [
          {
            data: Object.entries(professionData).map(([name, value]) => ({
              name,
              value,
            })),
          },
        ],
      });
    }

    // 处理战力分布数据
    const powerRanges = {
      "1000万以下": 0,
      "1000-2000万": 0,
      "2000-3000万": 0,
      "3000-4000万": 0,
      "4000-5000万": 0,
      "5000万以上": 0,
    };

    data.forEach((item) => {
      const power = item.combatPower;
      if (power < 10000000) powerRanges["1000万以下"]++;
      else if (power < 20000000) powerRanges["1000-2000万"]++;
      else if (power < 30000000) powerRanges["2000-3000万"]++;
      else if (power < 40000000) powerRanges["3000-4000万"]++;
      else if (power < 50000000) powerRanges["4000-5000万"]++;
      else powerRanges["5000万以上"]++;
    });

    // 更新战力分布图表
    if (powerChart) {
      powerChart.setOption({
        xAxis: {
          data: Object.keys(powerRanges),
        },
        series: [
          {
            data: Object.values(powerRanges),
          },
        ],
      });
    }

    // 处理服务器战力数据
    const serverData = data.reduce((acc, curr) => {
      if (!acc[curr.serverName]) {
        acc[curr.serverName] = {
          total: 0,
          count: 0,
        };
      }
      acc[curr.serverName].total += curr.combatPower;
      acc[curr.serverName].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // 更新趋势图
    if (trendChart) {
      const servers = Object.keys(serverData);
      const totals = servers.map((server) => ({
        value: serverData[server].total,
        count: serverData[server].count,
      }));

      trendChart.setOption({
        xAxis: {
          data: servers,
        },
        series: [
          {
            data: totals.map((item) => item.value),
          },
        ],
      });
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    message.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  // 确保DOM已经渲染完成
  nextTick(() => {
    initProfessionChart();
    initPowerChart();
    initTrendChart();
    fetchRankData();
  });

  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  professionChart?.resize();
  powerChart?.resize();
  trendChart?.resize();
};

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  professionChart?.dispose();
  powerChart?.dispose();
  trendChart?.dispose();
});
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  padding: 24px;

  // 修改统计卡片布局
  .statistics-row {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      flex: 1;
      min-width: 0; // 防止内容溢出
    }
  }

  .statistic-card {
    :deep(.ant-statistic-title) {
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.45);
    }

    :deep(.ant-statistic-content) {
      font-size: 24px;

      .anticon {
        margin-right: 8px;
        color: #1890ff;
      }
    }
  }

  .rank-list {
    height: 400px;
    overflow-y: auto;

    :deep(.ant-list-item) {
      padding: 12px 0;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    :deep(.ant-avatar) {
      color: #fff;
    }
  }
}
</style>
