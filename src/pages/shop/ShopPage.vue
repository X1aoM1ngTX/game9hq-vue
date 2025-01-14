<template>
  <div id="shopPage">
    <a-input-search
      v-model:value="searchValue"
      enter-button="搜索🔍"
      placeholder="输入游戏名搜索🔍"
      size="large"
      @search="onSearch"
    />
    <div class="game-cards">
      <a-card v-for="game in data" :key="game.id" class="game-card">
        <template #title>{{ game.gameName }}</template>
        <img
          v-if="game.gameCover"
          :src="game.gameCover"
          alt="Game Cover"
          style="width: 100%; height: auto; margin-bottom: 10px"
        />
        <p>
          原价:
          <a-tag :class="{ 'line-through': game.gameOnSale == 1 }" color="blue">
            {{ game.gamePrice === 0 ? "免费" : game.gamePrice + "￥" }}
          </a-tag>
        </p>
        <p v-if="game.gameOnSale !== 0">
          折扣价:
          <a-tag color="green"> {{ game.gameDiscountedPrices + "￥" }}</a-tag>
        </p>
        <p v-else>折扣价: ---</p>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 导入所需的组件和函数
import { ref } from "vue";
import { message } from "ant-design-vue";
import { searchGames } from "@/api/game";
// 导入日期处理库
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置 dayjs 为中文
dayjs.locale("zh-cn");

// 搜索关键词
const searchValue = ref("");
// 搜索处理函数
const onSearch = (value: string) => {
  fetchData(value);
};
// 表格数据
const data = ref([]);
// 表格列
const columns = [
  {
    title: "游戏名称",
    dataIndex: "gameName",
    key: "gameName",
  },
  {
    title: "游戏价格",
    dataIndex: "gamePrice",
    key: "gamePrice",
  },
  {
    title: "折扣价格",
    dataIndex: "gameDiscountedPrices",
    key: "gameDiscountedPrices",
  },
];

// 获取游戏列表数据
const fetchData = async (keyword = "") => {
  const res = await searchGames({
    gameName: keyword,
    current: 1,
    pageSize: 10,
  });
  if (res.data.code === 0) {
    data.value = res.data.data?.records || [];
  } else {
    message.error("游戏数据获取失败");
    data.value = [];
  }
};

// 初始化加载数据
fetchData();
</script>

<style scoped>
.game-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.game-card {
  width: calc(33.333% - 16px);
  box-sizing: border-box;
}

.line-through {
  text-decoration: line-through;
}

@media (max-width: 992px) {
  .game-card {
    width: calc(50% - 16px);
  }
}

@media (max-width: 576px) {
  .game-card {
    width: 100%;
  }
}
</style>
