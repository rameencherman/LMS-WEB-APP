<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Class Schedule</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Manage weekly timetable and batches.</p>
      </div>
      <div>
        <q-btn
          unelevated
          color="black"
          icon="add_circle"
          label="Schedule Class"
          no-caps
          class="rounded-borders"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Day Filter -->
    <div class="q-mb-lg flex q-gutter-sm">
      <q-btn
        v-for="day in weekDays"
        :key="day"
        :label="day"
        no-caps
        unelevated
        :color="selectedDay === day ? 'black' : 'white'"
        :text-color="selectedDay === day ? 'white' : 'black'"
        class="rounded-borders"
        @click="selectDay(day)"
      />
    </div>

    <q-card class="no-shadow border-gray rounded-borders bg-white">
      <div class="q-pa-md row items-center justify-between border-bottom">
        <div class="text-h6 text-weight-bold">{{ selectedDay }} Classes</div>
      </div>

      <div v-if="loading" class="q-pa-md text-center">
        <q-spinner color="black" size="2em" />
      </div>

      <div v-else-if="classes.length === 0" class="q-pa-xl text-center text-grey-7">
        <q-icon name="event_busy" size="40px" class="q-mb-sm" />
        <div>No classes scheduled for {{ selectedDay }}.</div>
      </div>

      <q-list separator v-else>
        <q-item v-for="cls in classes" :key="cls.id" class="q-py-md">
          <q-item-section avatar>
            <q-avatar color="blue-1" text-color="blue-9" icon="class" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-h6">{{
              cls.subjects?.name || 'Unknown Subject'
            }}</q-item-label>
            <q-item-label>{{ cls.name }}</q-item-label>
            <q-item-label caption>
              <q-icon name="schedule" size="xs" /> {{ formatTime(cls.start_time) }} -
              {{ formatTime(cls.end_time) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <div class="text-caption text-grey-8 q-mb-xs flex items-center">
              <q-icon name="person" size="xs" class="q-mr-xs" />
              {{ cls.profiles?.full_name || 'No Teacher' }}
            </div>
            <div class="row q-gutter-xs">
              <q-btn flat round icon="edit" size="sm" color="grey-7" @click="editClass(cls)" />
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="confirmDelete(cls)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 500px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ isEditing ? 'Edit Class' : 'Schedule New Class' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input outlined dense v-model="form.name" label="Class Name (e.g. Grade 10 A)" />

          <q-select
            outlined
            dense
            v-model="form.subject_id"
            :options="subjectOptions"
            label="Subject"
            emit-value
            map-options
          />

          <q-select
            outlined
            dense
            v-model="form.teacher_id"
            :options="teacherOptions"
            label="Teacher"
            emit-value
            map-options
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                outlined
                dense
                v-model="form.start_time"
                label="Start Time"
                type="time"
                stack-label
              />
            </div>
            <div class="col-6">
              <q-input
                outlined
                dense
                v-model="form.end_time"
                label="End Time"
                type="time"
                stack-label
              />
            </div>
          </div>

          <q-select
            outlined
            dense
            v-model="form.day_of_week"
            :options="weekDays"
            label="Day of Week"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps color="grey-8" />
          <q-btn
            unelevated
            :label="isEditing ? 'Update' : 'Schedule'"
            color="black"
            no-caps
            class="rounded-borders"
            @click="saveClass"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px" class="rounded-borders">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red-1" text-color="negative" />
          <div class="q-ml-md">
            <div class="text-weight-bold text-h6">Delete Class</div>
            <div class="text-grey-7">Are you sure? This will remove this slot.</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps color="grey-8" />
          <q-btn
            unelevated
            label="Delete"
            color="negative"
            no-caps
            class="rounded-borders"
            @click="deleteClass"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const selectedDay = ref('Monday')
const classes = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const form = ref({
  id: null,
  name: '',
  subject_id: null,
  teacher_id: null,
  start_time: '',
  end_time: '',
  day_of_week: 'Monday',
})
const classToDelete = ref(null)

const subjectOptions = ref([])
const teacherOptions = ref([])

const fetchClasses = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('classes')
    .select(
      `
            *,
            subjects (name),
            profiles (full_name)
        `,
    )
    .eq('day_of_week', selectedDay.value)
    .order('start_time', { ascending: true })

  if (error) {
    // If table doesn't exist yet, just ignore or show empty
    console.error(error)
    $q.notify({ type: 'negative', message: error.message })
  } else {
    classes.value = data
  }
  loading.value = false
}

const fetchOptions = async () => {
  // Subjects
  const { data: subData } = await supabase.from('subjects').select('id, name')
  if (subData) subjectOptions.value = subData.map((s) => ({ label: s.name, value: s.id }))

  // Teachers
  const { data: teachData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['admin', 'teacher'])
  if (teachData) teacherOptions.value = teachData.map((t) => ({ label: t.full_name, value: t.id }))
}

const selectDay = (day) => {
  selectedDay.value = day
  fetchClasses()
}

const openCreateDialog = () => {
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    subject_id: null,
    teacher_id: null,
    start_time: '08:00',
    end_time: '10:00',
    day_of_week: selectedDay.value,
  }
  showDialog.value = true
}

const editClass = (cls) => {
  isEditing.value = true
  form.value = { ...cls }
  showDialog.value = true
}

const saveClass = async () => {
  saving.value = true

  // Conflict Check
  if (form.value.teacher_id) {
    const { data: conflictData } = await supabase
      .from('classes')
      .select('id, start_time, end_time')
      .eq('day_of_week', form.value.day_of_week)
      .eq('teacher_id', form.value.teacher_id)
      .neq('id', form.value.id || -1) // Exclude self if editing

    if (conflictData) {
      const hasConflict = conflictData.some((c) => {
        return form.value.start_time < c.end_time && form.value.end_time > c.start_time
      })
      if (hasConflict) {
        $q.notify({ type: 'negative', message: 'Teacher is already booked in this slot!' })
        saving.value = false
        return
      }
    }
  }

  const payload = {
    name: form.value.name,
    subject_id: form.value.subject_id,
    teacher_id: form.value.teacher_id,
    start_time: form.value.start_time,
    end_time: form.value.end_time,
    day_of_week: form.value.day_of_week,
  }

  let error
  if (isEditing.value) {
    const { error: err } = await supabase.from('classes').update(payload).eq('id', form.value.id)
    error = err
  } else {
    const { error: err } = await supabase.from('classes').insert(payload)
    error = err
  }

  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  } else {
    $q.notify({ type: 'positive', message: 'Class scheduled successfully', color: 'black' })
    showDialog.value = false
    // If day changed interactively
    if (form.value.day_of_week !== selectedDay.value) {
      selectedDay.value = form.value.day_of_week
    }
    fetchClasses()
  }
  saving.value = false
}

const confirmDelete = (cls) => {
  classToDelete.value = cls
  showDeleteDialog.value = true
}

const deleteClass = async () => {
  deleting.value = true
  const { error } = await supabase.from('classes').delete().eq('id', classToDelete.value.id)
  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  } else {
    $q.notify({ type: 'negative', message: 'Class deleted', icon: 'delete' })
    showDeleteDialog.value = false
    fetchClasses()
  }
  deleting.value = false
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  // timeStr is HH:MM:SS
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${m} ${ampm}`
}

onMounted(() => {
  fetchOptions()
  fetchClasses()
})
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.border-gray {
  border: 1px solid #e0e0e0;
}
.border-bottom {
  border-bottom: 1px solid #f0f0f0;
}
.rounded-borders {
  border-radius: 12px;
}
</style>
