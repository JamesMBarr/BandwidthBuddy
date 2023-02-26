<script setup lang="ts">
import { signOut } from "firebase/auth";
import router from "@/router";
import { ref } from "vue";
import { auth } from "@/firebase";
import { useCurrentUser } from "vuefire";

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
        <h2 class="nav-title"><strong>Speed Monitor</strong></h2>
      </li>
    </ul>
    <ul>
      <li v-show="user">
        <button @click="logout" :aria-busy="loading">Logout</button>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="css">
.nav-title {
  padding: 0px;
  margin: 0px;
}
</style>
