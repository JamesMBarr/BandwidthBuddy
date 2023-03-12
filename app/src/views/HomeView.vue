<script setup lang="ts">
import {
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { onUnmounted, ref, computed } from "vue";
import { useCurrentUser } from "vuefire";
import { ArrowDown, ArrowUp, Timer } from "lucide-vue-next";

import Stat from "@/components/Stat.vue";
import TrendsChart from "@/components/TrendsChart.vue";
import { measurementsRef } from "@/firebase";
import type { ProcessedMeasurement } from "@shared/types";

const rawMeasurements = ref<ProcessedMeasurement[]>([]);
const loading = ref(true);
const error = ref<FirestoreError | null>(null);

const user = useCurrentUser();
const today = () => new Date().setHours(0, 0, 0, 0);
const numberOfMillisecondsPerDay = 24 * 60 * 60 * 1000;
const filterDate = new Date(today() - numberOfMillisecondsPerDay * 7);

const mostRecentQ = query(
  measurementsRef,
  where("user.id", "==", user.value?.uid),
  where("measurementDt", ">", filterDate),
  orderBy("measurementDt", "desc")
);

const unsubscribe = onSnapshot(mostRecentQ, (querySnapshot) => {
  rawMeasurements.value = [];

  querySnapshot.forEach((doc) => {
    rawMeasurements.value.push(doc.data() as ProcessedMeasurement);
    loading.value = false;
  });
  (e: FirestoreError) => {
    console.error(e);
    error.value = e;
    loading.value = false;
  };
});

const convertbpsToMbps = (speed: number) => speed / 1e6;
const round = (number: number, scale: number) =>
  Math.round(number / scale) * scale;

const measurements = computed(() => {
  return rawMeasurements.value.map((m) => ({
    ...m,
    download: round(convertbpsToMbps(m.download), 0.01),
    upload: round(convertbpsToMbps(m.upload), 0.01),
    latency: round(m.latency, 1),
  }));
});

const mostRecentMeasurement = computed(() => {
  return measurements.value[0];
});

onUnmounted(() => {
  unsubscribe();
});
</script>

<template>
  <div class="home-view">
    <div v-if="loading" class="placeholder-container">
      <h3>Loading...</h3>
      <progress></progress>
    </div>
    <div v-else-if="error" class="placeholder-container">
      <h2>😱 Oh no! An error has occurred</h2>
    </div>
    <div v-else-if="measurements.length === 0" class="placeholder-container">
      <h2>🤔 Hmm...</h2>
      <h2>you don't appear to have any measurements</h2>
    </div>
    <div v-else>
      <article class="stats">
        <h3 class="title">Latest</h3>
        <div class="received-at">
          <span>Received at:</span>
          {{ mostRecentMeasurement.measurementDt.toDate().toLocaleString() }}
        </div>
        <Stat
          id="download"
          :value="mostRecentMeasurement.download.toFixed(2)"
          label="Download"
          unit="Mbps"
        >
          <template v-slot:icon
            ><ArrowDown
              class="icon border"
              :style="{ color: 'rgb(54,162,235)' }"
          /></template>
        </Stat>
        <Stat
          id="upload"
          :value="mostRecentMeasurement.upload.toFixed(2)"
          label="Upload"
          unit="Mbps"
        >
          <template v-slot:icon
            ><ArrowUp class="icon border" :style="{ color: 'rgb(75,192,192)' }"
          /></template>
        </Stat>
        <Stat
          id="latency"
          :value="mostRecentMeasurement.latency.toFixed(0)"
          label="Latency"
          unit="ms"
        >
          <template v-slot:icon
            ><Timer class="icon" :style="{ color: 'rgb(255,205,86)' }"
          /></template>
        </Stat>
      </article>
      <article class="trends">
        <h3>Trends</h3>
        <TrendsChart :measurements="measurements" />
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/variables";

.home-view {
  .stats {
    margin-top: 0px;
    padding: calc(var(--spacing) * 2);

    display: grid;
    gap: var(--spacing);
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas: "title" "received" "download" "upload" "latency";

    @media (min-width: 350px) {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "title title"
        "received received"
        "download upload"
        "latency .";
    }

    @media (min-width: variables.$small-bp) {
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-areas:
        "title received received"
        "download upload latency";
    }

    .title {
      grid-area: title;
      margin: 0px;
    }

    .received-at {
      grid-area: received;
      // justify-self: end;
      display: flex;
      flex-direction: column;
      font-size: 1.25rem;

      span {
        font-size: 0.75rem;
        color: var(--muted-color);
      }
    }

    .icon {
      margin-right: calc(var(--spacing) * 0.25);
      stroke-width: 2px;

      &.border {
        border-style: solid;
        border-radius: 50%;
        border-width: 2px;
      }
    }
  }

  > .placeholder-container {
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;

    > h2 {
      margin-bottom: calc(var(--spacing) * 0.5);
    }
  }

  .trends {
    > h3 {
      margin-bottom: var(--spacing);
    }
  }
}
</style>
