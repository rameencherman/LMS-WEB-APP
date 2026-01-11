<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Attendance</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Mark and view student attendance.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-select
          outlined
          dense
          bg-color="white"
          v-model="selectedClass"
          :options="classOptions"
          label="Select Class"
          emit-value
          map-options
          @update:model-value="fetchAttendance"
        />
      </div>
      <div class="col-12 col-md-4">
        <q-input
          outlined
          dense
          bg-color="white"
          v-model="selectedDate"
          type="date"
          label="Date"
          @update:model-value="fetchAttendance"
        />
      </div>
      <div class="col-12 col-md-4 text-right">
        <q-btn
          v-if="selectedClass && students.length > 0"
          unelevated
          color="black"
          label="Mark All Present"
          no-caps
          class="rounded-borders"
          @click="markAllPresent"
        />
      </div>
    </div>

    <q-card class="no-shadow border-gray rounded-borders bg-white">
      <div v-if="loading" class="q-pa-xl text-center">
        <q-spinner color="black" size="2em" />
      </div>

      <div v-else-if="!selectedClass" class="q-pa-xl text-center text-grey-7">
        <q-icon name="class" size="40px" class="q-mb-sm" />
        <div>Please select a class to view attendance.</div>
      </div>

      <div v-else-if="students.length === 0" class="q-pa-xl text-center text-grey-7">
        <q-icon name="people_outline" size="40px" class="q-mb-sm" />
        <div>No students enrolled in this class.</div>
        <q-btn
          flat
          color="primary"
          no-caps
          label="Manage Enrollments"
          @click="showEnrollmentDialog = true"
        />
      </div>

      <q-list separator v-else>
        <q-item v-for="student in students" :key="student.id" class="q-py-md">
          <q-item-section avatar>
            <q-avatar size="40px" class="bg-grey-2" text-color="black">
              {{ getInitials(student.full_name) }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ student.full_name }}</q-item-label>
            <q-item-label caption>{{ student.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-sm bg-grey-1 rounded-borders q-pa-xs">
              <q-btn
                unelevated
                size="sm"
                :color="getAttendanceStatus(student.id) === 'present' ? 'green-6' : 'grey-4'"
                :text-color="getAttendanceStatus(student.id) === 'present' ? 'white' : 'grey-8'"
                label="Present"
                no-caps
                @click="updateStatus(student.id, 'present')"
              />
              <q-btn
                unelevated
                size="sm"
                :color="getAttendanceStatus(student.id) === 'absent' ? 'red-5' : 'grey-4'"
                :text-color="getAttendanceStatus(student.id) === 'absent' ? 'white' : 'grey-8'"
                label="Absent"
                no-caps
                @click="updateStatus(student.id, 'absent')"
              />
              <q-btn
                unelevated
                size="sm"
                :color="getAttendanceStatus(student.id) === 'late' ? 'orange-5' : 'grey-4'"
                :text-color="getAttendanceStatus(student.id) === 'late' ? 'white' : 'grey-8'"
                label="Late"
                no-caps
                @click="updateStatus(student.id, 'late')"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Enrollment Manager Dialog -->
    <q-dialog v-model="showEnrollmentDialog">
      <q-card style="min-width: 500px; height: 80vh" class="rounded-borders flex column">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Manage Enrollments</div>
          <div class="text-caption text-grey-7">
            Add or remove students for
            {{ classOptions.find((c) => c.value === selectedClass)?.label }}
          </div>
        </q-card-section>

        <q-card-section class="col overflow-auto">
          <q-input
            outlined
            dense
            v-model="enrollSearch"
            placeholder="Search students..."
            class="q-mb-md"
          >
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>

          <div v-if="enrollLoading" class="text-center"><q-spinner /></div>

          <q-list separator v-else>
            <q-item v-for="user in filteredAllStudents" :key="user.id" tag="label" v-ripple>
              <q-item-section avatar>
                <q-avatar size="32px" class="bg-grey-2">{{ getInitials(user.full_name) }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.full_name }}</q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :model-value="isEnrolled(user.id)"
                  @update:model-value="toggleEnrollment(user.id, $event)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Done" v-close-popup no-caps color="black" @click="fetchAttendance" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const classOptions = ref([])
const selectedClass = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const students = ref([]) // Enrolled students
const attendanceRecords = ref({}) // Map student_id -> status

// Enrollment Logic refs
const showEnrollmentDialog = ref(false)
const allStudents = ref([])
const enrollSearch = ref('')
const enrollLoading = ref(false)
const enrollmentSet = ref(new Set()) // Set of user_ids enrolled in current class

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

const fetchClasses = async () => {
  const { data } = await supabase.from('classes').select('id, name, day_of_week')
  if (data) {
    classOptions.value = data.map((c) => ({
      label: `${c.name} (${c.day_of_week})`,
      value: c.id,
    }))
  }
}

const fetchAttendance = async () => {
  if (!selectedClass.value || !selectedDate.value) return
  loading.value = true

  // 1. Get Enrolled Students
  const { data: enrollData } = await supabase
    .from('enrollments')
    .select('student_id, profiles(id, full_name, email)')
    .eq('class_id', selectedClass.value)

  if (enrollData) {
    students.value = enrollData.map((e) => e.profiles).filter((p) => !!p)
    // Also update enrollmentSet for the dialog
    enrollmentSet.value = new Set(enrollData.map((e) => e.student_id))
  }

  // 2. Get Attendance Records for Date
  const { data: attData } = await supabase
    .from('attendance')
    .select('student_id, status')
    .eq('class_id', selectedClass.value)
    .eq('date', selectedDate.value)

  attendanceRecords.value = {}
  if (attData) {
    attData.forEach((r) => {
      attendanceRecords.value[r.student_id] = r.status
    })
  }

  loading.value = false
}

const getAttendanceStatus = (studentId) => {
  return attendanceRecords.value[studentId] || null
}

const updateStatus = async (studentId, status) => {
  // Optimistic update
  attendanceRecords.value[studentId] = status

  const { error } = await supabase.from('attendance').upsert(
    {
      class_id: selectedClass.value,
      student_id: studentId,
      date: selectedDate.value,
      status: status,
    },
    { onConflict: 'class_id, student_id, date' },
  )

  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  }
}

const markAllPresent = async () => {
  // Determine students who don't have status or have non-present status
  const updates = students.value.map((s) => ({
    class_id: selectedClass.value,
    student_id: s.id,
    date: selectedDate.value,
    status: 'present',
  }))

  // Local update
  students.value.forEach((s) => (attendanceRecords.value[s.id] = 'present'))

  const { error } = await supabase
    .from('attendance')
    .upsert(updates, { onConflict: 'class_id, student_id, date' })
  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  } else {
    $q.notify({ type: 'positive', message: 'All marked present', color: 'black' })
  }
}

// Enrollment Dialog Logic
const fetchAllStudents = async () => {
  enrollLoading.value = true
  const { data } = await supabase.from('profiles').select('*').eq('role', 'student') // Only students
  if (data) allStudents.value = data
  enrollLoading.value = false
}

const filteredAllStudents = computed(() => {
  if (!enrollSearch.value) return allStudents.value
  const needle = enrollSearch.value.toLowerCase()
  return allStudents.value.filter(
    (s) => s.full_name.toLowerCase().includes(needle) || s.email.toLowerCase().includes(needle),
  )
})

const isEnrolled = (userId) => enrollmentSet.value.has(userId)

const toggleEnrollment = async (userId, val) => {
  // val is boolean true/false
  if (val) {
    // Add
    const { error } = await supabase
      .from('enrollments')
      .insert({ class_id: selectedClass.value, student_id: userId })
    if (!error) enrollmentSet.value.add(userId)
    else $q.notify({ type: 'negative', message: error.message })
  } else {
    // Remove
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .match({ class_id: selectedClass.value, student_id: userId })
    if (!error) enrollmentSet.value.delete(userId)
    else $q.notify({ type: 'negative', message: error.message })
  }
}

// Watch dialog open to fetch students
import { watch } from 'vue'
watch(showEnrollmentDialog, (val) => {
  if (val && allStudents.value.length === 0) {
    fetchAllStudents()
  }
})

onMounted(() => {
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
.rounded-borders {
  border-radius: 12px;
}
</style>
