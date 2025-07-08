import { defineStore } from "pinia";
import { ref } from "vue";
import { getSelfLibrary } from "@/api/userLibrary";

export const useUserLibraryStore = defineStore("userLibrary", () => {
  const games = ref([]);

  const fetchUserLibrary = async () => {
    try {
      const response = await getSelfLibrary();
      if (response.data.code === 0) {
        games.value = response.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch user library:", error);
    }
  };

  return { games, fetchUserLibrary };
});
