<template>
  <q-card class="no-shadow border-gray bg-white rounded-borders full-height">
    <q-card-section class="q-pa-lg border-bottom">
      <div class="text-h6 text-weight-bold font-inter">Recent Activity</div>
    </q-card-section>

    <q-scroll-area style="height: 350px">
      <q-list class="q-px-md">
        <q-item v-for="activity in activities" :key="activity.id" class="q-py-md">
          <q-item-section avatar>
            <q-avatar
              :icon="activity.icon"
              :color="activity.color"
              text-color="white"
              size="md"
              font-size="20px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ activity.title }}</q-item-label>
            <q-item-label caption class="text-grey-7">{{ activity.desc }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-item-label caption>{{ activity.time }}</q-item-label>
          </q-item-section>
        </q-item>

        <div
          v-if="activities.length === 0"
          class="flex flex-center full-height text-grey-5 q-pa-xl"
        >
          No recent activity.
        </div>
      </q-list>
    </q-scroll-area>
  </q-card>
</template>

<script setup>
const activities = []
</script>

<style lang="scss" scoped>
.border-gray {
  border: 1px solid #f0f0f0;
}
.border-bottom {
  border-bottom: 1px solid #f0f0f0;
}
.rounded-borders {
  border-radius: 16px;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
