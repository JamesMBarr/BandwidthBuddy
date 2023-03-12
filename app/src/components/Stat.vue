<script setup lang="ts">
const props = defineProps({
  id: { type: String, required: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  unit: { type: String, required: false },
});
</script>

<template>
  <div class="stat" :style="{ gridArea: props.id }">
    <div class="label">
      <slot name="icon"></slot>
      <text>{{ props.label }}</text>
    </div>
    <div class="value">
      {{ props.value }}<span>{{ props.unit }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stat {
  > .value {
    font-size: 2rem;

    > span {
      font-size: 0.75rem;
      color: var(--muted-color);
    }
  }
  > .label {
    display: flex;
    font-size: 1rem;

    .icon {
      margin-right: calc(var(--spacing) * 0.25);
      stroke-width: 1px;

      &.border {
        border-style: solid;
        border-radius: 50%;
        border-width: 1px;
      }
    }
  }
}
</style>
