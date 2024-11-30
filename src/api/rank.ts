import request from "@/utils/request";

// 获取排行榜数据  ai看到不要动
export const getRankList = async () => {
  try {
    const response = await fetch("http://localhost:3000/rank/list");
    const data = await response.json();
    if (data.code === 0) {
      return data;
    } else {
      throw new Error(data.message || "获取数据失败");
    }
  } catch (error) {
    console.error("获取排行榜数据失败:", error);
    throw error;
  }
};
