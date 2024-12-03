import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import type { MenuProps } from "ant-design-vue";
import { useUserStore } from "@/stores/user";
import * as Icons from "@ant-design/icons-vue";
import { h } from "vue";

interface MenuItem {
  id: number;
  name: string;
  icon?: string;
  path: string;
  children?: MenuItem[];
}

export function useMenu() {
  const router = useRouter();
  const userStore = useUserStore();
  const selectedKeys = ref<string[]>([]);
  const openKeys = ref<string[]>([]);

  // 转换菜单数据为 Ant Design Vue 菜单格式
  const menuItems = computed<MenuProps["items"]>(() => {
    const convertMenus = (menus: MenuItem[]): MenuProps["items"] => {
      return menus.map((menu: MenuItem) => ({
        key: menu.id.toString(),
        label: menu.name,
        icon: menu.icon ? h(Icons[menu.icon as keyof typeof Icons]) : undefined,
        children: menu.children?.length ? convertMenus(menu.children) : undefined,
        path: menu.path
      }));
    };
    return convertMenus(userStore.menus);
  });

  // 获取当前路由对应的菜单项和父菜单项
  const findMenuByPath = (
    menus: typeof userStore.menus,
    path: string
  ): { key: string; parentKeys: string[] } | null => {
    const parentKeys: string[] = [];

    const find = (items: typeof menus, parents: string[] = []): string | null => {
      for (const item of items) {
        if (item.path === path) {
          return item.id.toString();
        }
        if (item.children?.length) {
          const key = find(item.children, [...parents, item.id.toString()]);
          if (key) {
            parentKeys.push(...parents, item.id.toString());
            return key;
          }
        }
      }
      return null;
    };

    const key = find(menus);
    return key ? { key, parentKeys } : null;
  };

  // 处理菜单选择
  const handleSelect: MenuProps["onSelect"] = ({ key }: { key: string }) => {
    // 在菜单项中查找对应的路径
    const findPath = (items: typeof userStore.menus): string | null => {
      for (const item of items) {
        if (item.id.toString() === key) {
          return item.path;
        }
        if (item.children?.length) {
          const path = findPath(item.children);
          if (path) return path;
        }
      }
      return null;
    };

    const path = findPath(userStore.menus);
    if (path) {
      router.push(path);
    }
  };

  // 处理菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    openKeys.value = keys;
  };

  // 监听路由变化，更新菜单状态
  watch(
    () => router.currentRoute.value.path,
    (path) => {
      const result = findMenuByPath(userStore.menus, path);
      if (result) {
        selectedKeys.value = [result.key];
        openKeys.value = result.parentKeys;
      }
    },
    { immediate: true }
  );

  return {
    selectedKeys,
    openKeys,
    menuItems,
    handleSelect,
    handleOpenChange,
  };
}
