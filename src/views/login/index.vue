<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <a-card class="w-96">
      <h2 class="text-2xl font-bold text-center mb-8">系统登录</h2>
      <a-form
        :model="formState"
        name="login"
        autocomplete="off"
        @finish="handleFinish"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model:value="formState.username" placeholder="用户名">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="密码"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="w-full"
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue/es";
import UserOutlined from "@ant-design/icons-vue/UserOutlined";
import LockOutlined from "@ant-design/icons-vue/LockOutlined";
import { useUserStore } from "@/stores/user";
import { login } from "@/api/user";
import type { LoginParams } from "@/types/api";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const formState = reactive<LoginParams>({
  username: "",
  password: "",
});

const handleFinish = async (values: LoginParams) => {
  try {
    loading.value = true;
    const res = await login(values);
    await userStore.setLoginState(res);
    message.success("登录成功");
    router.push("/");
  } catch (error: any) {
    message.error(error.message || "登录失败");
  } finally {
    loading.value = false;
  }
};
</script>
