<script setup lang="ts">
import { signOut } from "firebase/auth";
import { ref } from "vue";
import { useCurrentUser } from "vuefire";
import router from "@/router";
import { auth } from "@/firebase";
import Logo from "@/components/Logo.vue";

const loading = ref(false);
const user = useCurrentUser();

async function logout() {
  try {
    loading.value = true;
    await signOut(auth);
    loading.value = false;
    router.push("/login");
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <nav class="container-fluid">
    <ul>
      <li>
        <Logo class="logo" />
      </li>
    </ul>
    <ul>
      <li v-show="user">
        <button @click="logout" :aria-busy="loading">Logout</button>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  .logo {
    height: var(--nav-element-height);
  }
}
</style>
