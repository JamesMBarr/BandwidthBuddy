<script setup lang="ts">
import { signOut as fbSignOut } from "firebase/auth";
import { ref } from "vue";
import { useCurrentUser } from "vuefire";
import { Menu } from "lucide-vue-next";
import router from "@/router";
import { auth } from "@/firebase";
import LogoWithName from "@/components/logos/LogoWithName.vue";
import PageOverlay from "@/components/PageOverlay.vue";
import SideBar from "@/components/SideBar.vue";
import UserTag from "@/components/UserTag.vue";

const loading = ref(false);
const user = useCurrentUser();

const sidebarOpen = ref(false);

async function signOut() {
  try {
    loading.value = true;
    await fbSignOut(auth);
    loading.value = false;
    sidebarOpen.value = false;
    router.push("/login");
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <nav class="container-fluid navbar">
    <ul>
      <li>
        <LogoWithName />
      </li>
    </ul>
    <ul v-show="user">
      <li>
        <UserTag />
      </li>
      <li>
        <button @click="signOut" class="outline" :aria-busy="loading">
          Logout
        </button>
      </li>
    </ul>
    <ul>
      <li>
        <Menu @click="sidebarOpen = true" />
      </li>
    </ul>
    <SideBar :class="{ open: sidebarOpen }" @signOut="signOut" />
    <PageOverlay :class="{ open: sidebarOpen }" @click="sidebarOpen = false" />
  </nav>
</template>

<style lang="scss" scoped>
@use "../assets/variables";

nav {
  .logo {
    height: var(--nav-element-height);
  }

  ul:nth-child(2) {
    display: none;

    @media (min-width: variables.$small-bp) {
      display: flex;
    }
  }

  ul:nth-child(3) {
    :first-child {
      cursor: pointer;
    }

    @media (min-width: variables.$small-bp) {
      display: none;
    }
  }
}
</style>
