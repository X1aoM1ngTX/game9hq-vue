<template>
  <div class="container">
    <!-- 月份标签 -->
    <div
      v-for="(month, index) in months"
      :key="index"
      class="month"
      :style="{ gridColumn: getMonthPosition(index) }"
    >
      {{ month }}
    </div>

    <!-- 星期标签 -->
    <span class="week">0</span>
    <span class="week">1</span>
    <span class="week">2</span>
    <span class="week">3</span>
    <span class="week">4</span>
    <span class="week">5</span>
    <span class="week">6</span>

    <!-- 贡献格子区域 -->
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

    <!-- 底部图例 -->
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
import { ref, computed, onMounted } from "vue";
import { getSignInHistory } from "@/api/user";

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
const days = ref([]);
const startRow = ref(0);
const totalSigns = ref(0);

onMounted(async () => {
  const res = await getSignInHistory(2025);
  if (res.data.code === 0) {
    generateCalendar(res.data.data || []);
  }
});

function generateCalendar(signInDates) {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  startRow.value = startDate.getDay();

  const allDays = [];
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

function getMonthPosition(monthIndex) {
  // 简单计算每个月的大致位置
  return Math.floor(monthIndex * 4.3) + 2;
}

// 暴露刷新方法给父组件
const refreshCalendar = async () => {
  const res = await getSignInHistory(2025);
  if (res.data.code === 0) {
    generateCalendar(res.data.data || []);
  }
};

defineExpose({
  refreshCalendar
});
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: auto repeat(53, 10px);
  grid-template-rows: auto repeat(7, 10px) auto;
  gap: 3px;
  width: fit-content;
  padding: 14px;
  font-size: 12px;
  border: solid 1px #d1d9e0;
  border-radius: 6px;
}

.month {
  grid-row: 1/2;
  margin-bottom: -3px;
}

.week {
  grid-column: 1/2;
  line-height: 10px;
  margin-right: 3px;
  grid-row-start: 2;
}

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

.tiles {
  grid-row: 2/9;
  grid-column: 2/55;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-auto-flow: column;
}

.tile {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  outline: 1px solid rgba(27, 35, 36, 0.06);
  outline-offset: -1px;
}

.tile[data-level="0"] {
  background: #ebedf0;
}

.tile[data-level="1"] {
  background: #40c463;
}

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
