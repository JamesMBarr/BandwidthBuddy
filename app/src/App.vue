<script setup lang="ts">
import { RouterView } from "vue-router";
import NavBar from "@/components/NavBar.vue";
import "@/assets/base.css";
</script>

<template>
  <NavBar />
  <main class="container"><RouterView /></main>
  <footer class="container-fluid">Created by: James Barr</footer>
</template>

<style scoped lang="css">
.nav-title {
  padding: 0px;
  margin: 0px;
}
</style>
