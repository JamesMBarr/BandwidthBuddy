<script setup lang="ts">
import { useCurrentUser } from "vuefire";
import { LogOut } from "lucide-vue-next";

import Logo from "@/components/logos/Logo.vue";
import UserTag from "@/components/UserTag.vue";

const user = useCurrentUser();
</script>

<template>
  <div class="sidebar container">
    <div class="logo-container">
      <Logo />
    </div>
    <UserTag v-show="user" :inverse-icon="true" :vertical-align="true" />
    <div v-show="user" class="items-container">
      <div class="item" @click="() => $emit('signOut')">
        <LogOut class="icon" />
        Signout
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use "../assets/variables";

$sidebar-width: 18rem;

.sidebar {
  position: fixed;
  z-index: 11;
  top: 0;
  right: -$sidebar-width;
  height: 100vh;
  width: $sidebar-width;
  color: var(--primary-inverse);
  background-color: var(--primary);

  transform: translateX(0);
  transition: transform variables.$duration ease;

  &.open {
    transform: translateX(-$sidebar-width);
  }

  > .logo-container {
    display: flex;
    justify-content: center;
    padding-top: var(--spacing);

    > .logo {
      height: var(--nav-element-height);
    }
  }

  .user-tag {
    padding-top: calc(var(--spacing));
  }

  .items-container {
    padding: calc(var(--spacing) * 2) 0;

    > .item {
      display: flex;
      justify-content: center;
      cursor: pointer;

      > .icon {
        margin-right: calc(var(--spacing) * 0.5);
      }
    }
  }
}
</style>
