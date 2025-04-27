<template>
  <div class="container">
    <!-- 月份标签：显示一年12个月的标签 -->
    <div
      v-for="(month, index) in months"
      :key="index"
      class="month"
      :style="{ gridColumn: getMonthPosition(index) }"
    >
      {{ month }}
    </div>

    <!-- 签到格子区域：显示一年的签到记录 -->
    <div class="tiles">
      <i
        v-for="(day, index) in days"
        :key="index"
        class="tile"
        :data-level="day.signed ? 1 : 0"
        :title="`${day.date}: ${day.signed ? '已签到' : '未签到'}`"
        :style="index === 0 ? { gridRow: startRow + 1 } : {}"
      />
    </div>

    <!-- 底部统计和图例 -->
    <div class="total">已签到 {{ totalSigns }} 天</div>
    <div class="legend">
      未签到
      <i class="tile" data-level="0" />
      已签到
      <i class="tile" data-level="1" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from "vue";
import { getSignInHistory } from "@/api/user";

// 月份标签数据
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// 响应式数据
const days = ref([]); // 存储所有日期的签到状态
const startRow = ref(0); // 第一天的起始行位置
const totalSigns = ref(0); // 总签到天数

// 组件挂载时获取签到历史
onMounted(async () => {
  const res = await getSignInHistory(2025);
  if (res.data.code === 0) {
    generateCalendar(res.data.data || []);
  }
});

/**
 * 生成日历数据
 * @param {string[]} signInDates - 已签到日期的数组
 */
function generateCalendar(signInDates) {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1); // 年初
  startRow.value = startDate.getDay(); // 获取第一天是星期几

  const allDays = [];
  // 遍历整年的每一天
  for (
    let date = startDate;
    date <= new Date(year, 11, 31);
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split("T")[0];
    const signed = signInDates.includes(dateStr);
    if (signed) totalSigns.value++;
    allDays.push({ date: dateStr, signed });
  }
  days.value = allDays;
}

/**
 * 计算月份标签的位置
 * @param {number} monthIndex - 月份索引(0-11)
 * @returns {number} 网格列位置
 */
function getMonthPosition(monthIndex) {
  return Math.floor(monthIndex * 4.3) + 2; // 4.3是每月平均周数
}

/**
 * 刷新日历数据
 * 供父组件调用的方法
 */
const refreshCalendar = async () => {
  const res = await getSignInHistory(2025);
  if (res.data.code === 0) {
    generateCalendar(res.data.data || []);
  }
};

// 暴露方法给父组件
defineExpose({
  refreshCalendar,
});
</script>

<style scoped>
/* 日历容器：使用CSS Grid布局 */
.container {
  display: grid;
  grid-template-columns: auto repeat(53, 10px); /* 53列表示53周 */
  grid-template-rows: auto repeat(7, 10px) auto; /* 7行表示一周7天 */
  gap: 3px;
  width: fit-content;
  padding: 14px;
  font-size: 12px;
  border: solid 1px #d1d9e0;
  border-radius: 6px;
}

/* 月份标签样式 */
.month {
  grid-row: 1/2;
  margin-bottom: -3px;
}

/* 星期标签样式 */
.week {
  grid-column: 1/2;
  line-height: 10px;
  margin-right: 3px;
  grid-row-start: 2;
}

/* 使用相邻选择器设置每个星期标签的位置 */
.week + .week {
  grid-row-start: 3;
}
.week + .week + .week {
  grid-row-start: 4;
}
.week + .week + .week + .week {
  grid-row-start: 5;
}
.week + .week + .week + .week + .week {
  grid-row-start: 6;
}
.week + .week + .week + .week + .week + .week {
  grid-row-start: 7;
}
.week + .week + .week + .week + .week + .week + .week {
  grid-row-start: 8;
}

/* 签到格子区域样式 */
.tiles {
  grid-row: 2/9;
  grid-column: 2/55;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-auto-flow: column;
}

/* 单个格子样式 */
.tile {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  outline: 1px solid rgba(27, 35, 36, 0.06);
  outline-offset: -1px;
}

/* 签到状态颜色 */
.tile[data-level="0"] {
  background: #ebedf0;
} /* 未签到 */
.tile[data-level="1"] {
  background: #40c463;
} /* 已签到 */

/* 底部统计和图例样式 */
.total {
  grid-column: 2/30;
  margin-top: 4px;
}

.legend {
  grid-column: 30/53;
  margin-top: 4px;
  display: flex;
  gap: 5px;
  justify-content: right;
  align-items: center;
}
</style>
