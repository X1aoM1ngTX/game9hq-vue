<template>
  <div class="user-layout">
    <UserLeft />
    <div class="user-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserLeft from "@/components/UserLeft.vue";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (route.path === "/user") {
    router.push("/user/login");
  }
});
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
}

.user-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
