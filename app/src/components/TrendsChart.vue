<script setup lang="ts">
import { computed, type PropType } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-luxon";
import { Line } from "vue-chartjs";
import type { ProcessedMeasurement } from "@shared/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  measurements: {
    type: Array as PropType<ProcessedMeasurement[]>,
    required: true,
  },
});

// TODO: fix update the chart bug
const datasets = computed(() => {
  const datasets = {
    download: {
      label: "Download",
      data: [] as any,
      borderColor: "rgb(54,162,235)",
      backgroundColor: "rgb(54,162,235, 0.5)",
    },
    upload: {
      label: "Upload",
      data: [] as any,
      borderColor: "rgb(75,192,192)",
      backgroundColor: "rgb(75,192,192, 0.5)",
    },
    latency: {
      label: "Latency",
      data: [] as any,
      borderColor: "rgb(255,205,86)",
      backgroundColor: "rgb(255,205,86, 0.5)",
    },
  };

  props.measurements.forEach((m) => {
    datasets.download.data.push({
      x: m.measurementDt.toDate().toISOString(),
      y: m.download,
    });

    datasets.upload.data.push({
      x: m.measurementDt.toDate().toISOString(),
      y: m.upload,
    });

    datasets.latency.data.push({
      x: m.measurementDt.toDate().toISOString(),
      y: m.latency,
    });
  });

  // TODO: fix this!
  // @ts-ignore
  return Object.keys(datasets).map((k) => datasets[k]);
});

// TODO: typing
const chartOptions: any = {
  responsive: true,
  scales: {
    xAxis: {
      type: "time",
      time: {
        // Luxon format string
        tooltipFormat: "DD T",
      },
    },
  },
};
</script>

<template>
  <Line :options="chartOptions" :data="{ datasets }" />
</template>
