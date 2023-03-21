<script setup lang="ts">
import { RouterView } from "vue-router";
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <NavBar />
  <main class="container">
    <RouterView />
  </main>
  <footer class="container-fluid">
    <div>Created by: James Barr</div>
  </footer>
</template>

<style lang="scss">
@import url(https://fonts.googleapis.com/css?family=Poppins);

:root {
  font-family: Poppins;
  font-weight: 400;
  font-style: normal;
  font-display: auto;
  --nav-element-height: 4rem;
  --footer-height: 2rem;
}

article {
  padding: calc(var(--spacing) * 2);
}

body > main {
  padding-top: var(--spacing);
  padding-bottom: var(--spacing);
  min-height: calc(
    100vh - var(--nav-element-height) -
      (var(--nav-element-spacing-vertical) * 2) - var(--footer-height) -
      (var(--spacing) * 2)
  );
}

body > footer {
  padding: var(--spacing);

  div {
    height: var(--footer-height);
  }
}
</style>
