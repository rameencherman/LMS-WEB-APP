<template>
  <q-card
    class="shadow-1 border-gray bg-white rounded-borders q-pa-lg stats-card cursor-pointer full-height column justify-between"
  >
    <div class="row items-center justify-between q-mb-lg">
      <div
        class="bg-grey-1 q-pa-sm rounded-circle row flex-center shadow-sm"
        style="width: 60px; height: 60px"
      >
        <q-icon :name="icon" size="28px" color="black" />
      </div>
      <q-badge
        v-if="trend !== undefined"
        :color="getTrendColor(trend)"
        :text-color="getTrendTextColor(trend)"
        class="q-py-xs q-px-sm rounded-borders font-weight-bold"
      >
        <q-icon :name="getTrendIcon(trend)" size="12px" class="q-mr-xs" v-if="trend !== 0" />
        <span v-if="trend === 0" class="q-mr-xs">•</span>
        {{ Math.abs(trend) }}%
      </q-badge>
    </div>
    <div>
      <div class="text-h3 text-weight-bolder q-mb-sm font-inter tracking-tight text-black">
        {{ value }}
      </div>
      <div class="text-grey-6 text-caption text-weight-bold text-uppercase tracking-wide">
        {{ label }}
      </div>
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  trend: {
    type: Number,
    default: undefined,
  },
})

const getTrendColor = (t) => {
  if (t > 0) return 'green-1'
  if (t < 0) return 'red-1'
  return 'grey-2' // Neutral for 0
}

const getTrendTextColor = (t) => {
  if (t > 0) return 'green-9'
  if (t < 0) return 'red-9'
  return 'grey-8'
}

const getTrendIcon = (t) => {
  if (t > 0) return 'arrow_upward'
  if (t < 0) return 'arrow_downward'
  return ''
}
</script>

<style lang="scss" scoped>
.border-gray {
  border: 1px solid #f0f0f0;
}
.rounded-borders {
  border-radius: 16px;
}
.rounded-circle {
  border-radius: 50%;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
.stats-card {
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
    border-color: transparent;
  }
}
</style>
