<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">System Settings</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Manage application preferences and logs.</p>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Appearance Settings -->
      <div class="col-12 col-md-6">
        <q-card class="no-shadow border-gray rounded-borders h-100">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-sm">Appearance</div>
            <q-separator />
          </q-card-section>
          <q-card-section>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-icon name="dark_mode" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dark Mode</q-item-label>
                <q-item-label caption>Switch between light and dark themes</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle color="black" v-model="darkMode" @update:model-value="toggleDarkMode" />
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>

      <!-- Admin: Audit Logs -->
      <div class="col-12" v-if="isAdmin">
        <q-card class="no-shadow border-gray rounded-borders">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">Audit Logs (Admin)</div>
            <q-btn flat dense icon="refresh" @click="fetchLogs" />
          </q-card-section>
          <q-table :rows="logs" :columns="logColumns" row-key="id" flat :loading="loadingLogs">
            <template v-slot:body-cell-user="props">
              <q-td :props="props">
                {{ props.row.profiles?.full_name || props.row.user_id }}
              </q-td>
            </template>
            <template v-slot:body-cell-date="props">
              <q-td :props="props">
                {{ new Date(props.row.created_at).toLocaleString() }}
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const darkMode = ref($q.dark.isActive)
const logs = ref([])
const loadingLogs = ref(false)
const isAdmin = ref(false)

const logColumns = [
  { name: 'action', label: 'Action', field: 'action', align: 'left', sortable: true },
  { name: 'user', label: 'User', field: 'user', align: 'left' },
  { name: 'details', label: 'Details', field: 'details', align: 'left' },
  { name: 'date', label: 'Date', field: 'created_at', align: 'right', sortable: true },
]

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (data?.role === 'admin') {
      isAdmin.value = true
      fetchLogs()
    }
  }
})

const toggleDarkMode = (val) => {
  $q.dark.set(val)
}

const fetchLogs = async () => {
  loadingLogs.value = true
  const { data } = await supabase
    .from('audit_logs')
    .select('*, profiles:user_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (data) logs.value = data
  loadingLogs.value = false
}
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.border-gray {
  border: 1px solid #e0e0e0;
}
.rounded-borders {
  border-radius: 12px;
}
.h-100 {
  height: 100%;
}
</style>
