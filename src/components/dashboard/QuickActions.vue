<template>
  <q-card class="no-shadow border-gray bg-white rounded-borders q-pa-lg full-height">
    <div class="text-h6 text-weight-bold q-mb-md font-inter">Quick Actions</div>
    <div class="row q-col-gutter-md">
      <div class="col-6 col-sm-3" v-for="action in actions" :key="action.label">
        <q-btn
          unelevated
          class="full-width column q-py-md action-btn"
          :class="action.bgColor"
          @click="action.handler"
        >
          <q-icon :name="action.icon" size="28px" :class="action.textColor" class="q-mb-sm" />
          <div :class="action.textColor" class="text-weight-bold text-caption">
            {{ action.label }}
          </div>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script setup>
const actions = [
  {
    label: 'New Enrollment',
    icon: 'person_add',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-9',
    handler: () => {},
  },
  {
    label: 'Collect Fees',
    icon: 'payments',
    bgColor: 'bg-green-50',
    textColor: 'text-green-9',
    handler: () => {},
  },
  {
    label: 'Mark Attendance',
    icon: 'qr_code_scanner',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-9',
    handler: () => {},
  },
  {
    label: 'Schedule Class',
    icon: 'event',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-9',
    handler: () => {},
  },
]
</script>

<style lang="scss" scoped>
.border-gray {
  border: 1px solid #f0f0f0;
}
.rounded-borders {
  border-radius: 16px;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
.bg-blue-50 {
  background-color: #eff6ff;
}
.bg-green-50 {
  background-color: #f0fdf4;
}
.bg-purple-50 {
  background-color: #faf5ff;
}
.bg-orange-50 {
  background-color: #fff7ed;
}

.action-btn {
  border-radius: 12px;
  height: 100px;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.02);
  }
}
</style>
