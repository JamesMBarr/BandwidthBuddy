<template>
  <div class="page-overlay"></div>
</template>
<style lang="scss" scoped>
@use "../assets/variables";

.page-overlay {
  position: fixed;
  z-index: 10;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: rgba(0, 0, 0, 0);
  -webkit-backdrop-filter: blur(0px);
  backdrop-filter: blur(0px);

  visibility: hidden;

  transition: background-color variables.$duration ease,
    backdrop-filter variables.$duration ease,
    visibility variables.$duration linear;

  &.open {
    visibility: visible;
    background-color: rgba(0, 0, 0, 0.1);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);

    transition: background-color variables.$duration ease,
      backdrop-filter variables.$duration ease;
  }
}
</style>
