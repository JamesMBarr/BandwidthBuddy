<script setup lang="ts">
import { RouterView } from "vue-router";
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <header>
    <NavBar />
  </header>
  <main class="container"><RouterView /></main>
  <footer>Created by: James Barr</footer>
</template>

<style scoped lang="css">
.nav-title {
  padding: 0px;
  margin: 0px;
}
</style>
