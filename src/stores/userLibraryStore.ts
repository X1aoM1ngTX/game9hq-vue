import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserLibrary } from "@/api/userLibrary"; // 假设你有这个 API

export const useUserLibraryStore = defineStore("userLibrary", () => {
  const games = ref([]);

  const fetchUserLibrary = async () => {
    try {
      const response = await getUserLibrary();
      if (response.data.code === 0) {
        games.value = response.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch user library:", error);
    }
  };

  return { games, fetchUserLibrary };
});
