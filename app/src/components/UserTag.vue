<script setup lang="ts">
import { useCurrentUser } from "vuefire";
import { User } from "lucide-vue-next";

const props = defineProps({
  inverseIcon: { type: Boolean, default: false },
  verticalAlign: { type: Boolean, default: false },
});

const user = useCurrentUser();
</script>
<template>
  <div class="user-tag" :class="{ vertical: verticalAlign }">
    <div v-if="user?.displayName" class="display-name">
      {{ user?.displayName }}
    </div>
    <div class="user-icon">
      <img
        v-if="!user?.photoURL"
        :src="user?.photoURL!"
        alt="User icon image"
      />
      <User v-else :class="{ inverse: props.inverseIcon }" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use "../assets/variables";

.user-tag {
  display: flex;
  align-items: center;

  &.vertical {
    flex-direction: column-reverse;
  }

  > .display-name {
    text-align: end;
    padding-right: calc(0.25rem);
  }

  > .user-icon {
    > :first-child {
      height: 32px;
      width: 32px;
      object-fit: cover;
      border-radius: 50%;

      stroke-width: 1px;
      color: var(--primary-inverse);
      background-color: var(--primary);

      &.inverse {
        color: var(--primary);
        background-color: var(--primary-inverse);
      }
    }
  }
}
</style>
