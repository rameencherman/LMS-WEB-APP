<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <!-- Welcome Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Dashboard</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Overview of your institute's performance.</p>
      </div>
      <div class="flex q-gutter-sm">
        <q-btn
          unelevated
          color="white"
          text-color="black"
          icon="download"
          label="Export Report"
          no-caps
          class="rounded-borders border-gray"
        />
        <q-btn
          unelevated
          color="black"
          icon="add"
          label="New Admission"
          no-caps
          class="rounded-borders"
        />
      </div>
    </div>

    <!-- Stats Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-4" v-for="(stat, index) in stats" :key="index">
        <StatsCard v-bind="stat" />
      </div>
    </div>

    <!-- Quick Actions Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12">
        <QuickActions />
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row q-col-gutter-lg">
      <!-- Left: Upcoming Schedule -->
      <div class="col-12 col-md-8">
        <UpcomingClasses />
      </div>

      <!-- Right: Recent Activity -->
      <div class="col-12 col-md-4">
        <RecentActivity />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import StatsCard from 'components/dashboard/StatsCard.vue'
import UpcomingClasses from 'components/dashboard/UpcomingClasses.vue'
import RecentActivity from 'components/dashboard/RecentActivity.vue'
import QuickActions from 'components/dashboard/QuickActions.vue'

const stats = [
  { label: 'Total Students', value: '0', icon: 'people', trend: 0 },
  { label: 'Monthly Revenue', value: '0 LKR', icon: 'payments', trend: 0 },
  { label: 'Active Classes', value: '0', icon: 'class', trend: 0 },
]
</script>

<style lang="scss" scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.border-gray {
  border: 1px solid #e0e0e0;
}
.rounded-borders {
  border-radius: 12px;
}
</style>
