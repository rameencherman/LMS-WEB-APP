<template>
  <q-card class="no-shadow border-gray bg-white rounded-borders full-height">
    <q-card-section class="q-pa-lg border-bottom row items-center justify-between">
      <div class="text-h6 text-weight-bold font-inter">Upcoming Classes</div>
      <q-btn flat dense color="grey-7" icon="more_horiz" />
    </q-card-section>

    <q-list separator>
      <q-item v-for="cls in classes" :key="cls.id" class="q-py-md q-px-lg hover-bg">
        <q-item-section avatar>
          <div class="column flex-center bg-grey-1 rounded-borders q-pa-sm" style="width: 50px">
            <div class="text-weight-bold text-black">{{ cls.timeStart }}</div>
            <div class="text-caption text-grey-6">{{ cls.timeEnd }}</div>
          </div>
        </q-item-section>
        <q-item-section>
          <div class="text-subtitle1 text-weight-bold">{{ cls.subject }}</div>
          <div class="text-caption text-grey-7">Grade {{ cls.grade }} • {{ cls.teacher }}</div>
        </q-item-section>
        <q-item-section side>
          <q-chip
            :label="cls.hall"
            color="grey-2"
            text-color="black"
            size="sm"
            class="text-weight-bold"
          />
        </q-item-section>
      </q-item>

      <div v-if="classes.length === 0" class="flex flex-center q-pa-xl text-grey-5">
        No classes scheduled for today.
      </div>
    </q-list>
    <q-card-actions align="center" class="q-py-md">
      <q-btn flat label="View Full Schedule" color="primary" no-caps class="text-weight-bold" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
const classes = []
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
.hover-bg {
  transition: background 0.2s;
  &:hover {
    background: #fafafa;
  }
}
</style>
