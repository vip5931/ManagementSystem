import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getCurrentUser } from "@/api/user";
import type { UserInfo, MenuItem, LoginResponse } from "@/types/api";

export const useUserStore = defineStore("user", () => {
  const token = ref("");
  const userInfo = ref<UserInfo | null>(null);
  const menus = ref<MenuItem[]>([]);

  // 计算用户的所有权限码
  const permissions = computed(() => {
    const codes = new Set<string>();

    const extractCodes = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.permission_code) {
          codes.add(item.permission_code);
        }
        if (item.children?.length) {
          extractCodes(item.children);
        }
      });
    };

    extractCodes(menus.value);
    return Array.from(codes);
  });

  // 检查是否有某个权限
  const hasPermission = (code: string) => {
    return permissions.value.includes(code);
  };

  const setLoginState = async (loginResponse: LoginResponse) => {
    token.value = loginResponse.token;
    userInfo.value = loginResponse.user;
    menus.value = loginResponse.menus;
    localStorage.setItem("token", loginResponse.token);
  };

  const logout = () => {
    token.value = "";
    userInfo.value = null;
    menus.value = [];
    localStorage.removeItem("token");
  };

  // 初始化状态
  const initState = async () => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      token.value = savedToken;
      try {
        const res: any = await getCurrentUser();
        userInfo.value = res.user;
        menus.value = res.menus;
        return true;
      } catch (error) {
        logout();
        return false;
      }
    }

    return false;
  };

  return {
    token,
    userInfo,
    menus,
    permissions,
    hasPermission,
    setLoginState,
    logout,
    initState,
  };
});
