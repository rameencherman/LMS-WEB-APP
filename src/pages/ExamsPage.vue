<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Exams & Results</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Schedule exams and manage student marks.</p>
      </div>
      <div>
        <q-btn
          unelevated
          color="black"
          icon="add_circle"
          label="Schedule Exam"
          no-caps
          class="rounded-borders"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <q-card class="no-shadow border-gray rounded-borders bg-white">
      <div class="q-pa-md row items-center justify-between border-bottom">
        <div class="text-h6 text-weight-bold">Upcoming & Recent Exams</div>
        <q-input
          outlined
          dense
          v-model="filter"
          placeholder="Search exams..."
          class="header-search"
        >
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
      </div>

      <q-table
        :rows="exams"
        :columns="columns"
        row-key="id"
        :filter="filter"
        flat
        class="font-inter"
        :loading="loading"
      >
        <template v-slot:body-cell-subject="props">
          <q-td :props="props">
            <span class="text-weight-bold">{{ props.row.subjects?.name }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-date="props">
          <q-td :props="props">
            {{ formatDate(props.row.date) }}
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              unelevated
              size="sm"
              color="blue-1"
              text-color="blue-9"
              label="Results"
              icon="assessment"
              no-caps
              class="q-mr-sm"
              @click="openResultsDialog(props.row)"
            />
            <q-btn flat round icon="edit" size="sm" color="grey-7" @click="editExam(props.row)" />
            <q-btn
              flat
              round
              icon="delete"
              size="sm"
              color="negative"
              class="q-ml-sm"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Create/Edit Exam Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ isEditing ? 'Edit Exam' : 'Schedule New Exam' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            outlined
            dense
            v-model="form.title"
            label="Exam Title (e.g. Final Term Biology)"
          />
          <q-select
            outlined
            dense
            v-model="form.subject_id"
            :options="subjectOptions"
            label="Subject"
            emit-value
            map-options
          />
          <q-input outlined dense v-model="form.date" type="date" label="Date" stack-label />
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
          <q-input outlined dense v-model="form.total_marks" type="number" label="Total Marks" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps color="grey-8" />
          <q-btn
            unelevated
            :label="isEditing ? 'Update' : 'Schedule'"
            color="black"
            no-caps
            class="rounded-borders"
            @click="saveExam"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Results Management Dialog -->
    <q-dialog v-model="showResultsDialog" maximize>
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-white text-black border-bottom q-pa-md">
          <q-toolbar-title class="text-weight-bold">
            Results: {{ selectedExam?.title }}
            <span class="text-caption text-grey-7 q-ml-sm"
              >{{ selectedExam?.subjects?.name }} • {{ formatDate(selectedExam?.date) }}</span
            >
          </q-toolbar-title>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Student List / Marks Entry -->
            <div class="col-12 col-md-8">
              <q-card class="no-shadow border-gray rounded-borders">
                <q-card-section class="row items-center justify-between">
                  <div class="text-h6">Student Marks</div>
                  <div class="text-caption">Total Marks: {{ selectedExam?.total_marks }}</div>
                </q-card-section>

                <q-table :rows="resultsData" :columns="resultsColumns" row-key="student_id" flat>
                  <template v-slot:body-cell-marks="props">
                    <q-td :props="props">
                      <q-input
                        dense
                        outlined
                        v-model.number="props.row.marks_obtained"
                        type="number"
                        style="width: 80px"
                        @blur="saveSingleResult(props.row)"
                        :rules="[(val) => val <= selectedExam?.total_marks || 'Max exceeded']"
                      />
                    </q-td>
                  </template>
                  <template v-slot:body-cell-grade="props">
                    <q-td :props="props">
                      <q-chip
                        size="sm"
                        :color="getGradeColor(props.row.grade)"
                        text-color="white"
                        v-if="props.row.grade"
                      >
                        {{ props.row.grade }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-card>
            </div>

            <!-- Statistics / Charts (Placeholder for now) -->
            <div class="col-12 col-md-4">
              <q-card class="no-shadow border-gray rounded-borders q-pa-md">
                <div class="text-h6 q-mb-md">Instructions</div>
                <p class="text-grey-7">
                  1. Enter numeric marks for each student.<br />
                  2. Grade is auto-calculated based on percentage.<br />
                  3. System auto-saves when you click away/blur from the input.<br />
                </p>
                <q-separator class="q-my-md" />
                <div class="text-weight-bold">Grading Scale:</div>
                <div class="row justify-between text-caption q-mt-sm">
                  <span>A (>= 75%)</span>
                  <span>B (>= 60%)</span>
                  <span>C (>= 50%)</span>
                  <span>D (>= 35%)</span>
                  <span>F (&lt; 35%)</span>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px" class="rounded-borders">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red-1" text-color="negative" />
          <div class="q-ml-md">
            <div class="text-weight-bold text-h6">Delete Exam</div>
            <div class="text-grey-7">Are you sure? This deletes all associated results too.</div>
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
            @click="deleteExam"
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
const exams = ref([])
const loading = ref(false)
const filter = ref('')
const showDialog = ref(false)
const showResultsDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const examToDelete = ref(null)
const selectedExam = ref(null)
const subjectOptions = ref([])

// Form for Exam
const form = ref({
  id: null,
  title: '',
  subject_id: null,
  date: '',
  start_time: '',
  end_time: '',
  total_marks: 100,
})

// Columns
const columns = [
  { name: 'title', label: 'Exam Title', align: 'left', field: 'title', sortable: true },
  { name: 'subject', label: 'Subject', align: 'left', field: 'subject_id', sortable: true },
  { name: 'date', label: 'Date', align: 'left', field: 'date', sortable: true },
  { name: 'total_marks', label: 'Total Marks', align: 'center', field: 'total_marks' },
  { name: 'actions', label: 'Actions', align: 'right' },
]

const resultsColumns = [
  {
    name: 'student_name',
    label: 'Student Name',
    align: 'left',
    field: (row) => row.profiles?.full_name,
    sortable: true,
  },
  {
    name: 'marks',
    label: 'Marks Obtained',
    align: 'left',
    field: 'marks_obtained',
    sortable: true,
  },
  { name: 'grade', label: 'Grade', align: 'left', field: 'grade' },
]

const resultsData = ref([])

onMounted(async () => {
  fetchExams()
  // Fetch Subjects for options
  const { data } = await supabase.from('subjects').select('id, name')
  if (data) subjectOptions.value = data.map((s) => ({ label: s.name, value: s.id }))
})

const fetchExams = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('exams')
    .select('*, subjects(name)')
    .order('date', { ascending: false })

  if (error) $q.notify({ type: 'negative', message: error.message })
  else exams.value = data
  loading.value = false
}

const openCreateDialog = () => {
  isEditing.value = false
  form.value = {
    id: null,
    title: '',
    subject_id: null,
    date: '',
    start_time: '',
    end_time: '',
    total_marks: 100,
  }
  showDialog.value = true
}

const editExam = (row) => {
  isEditing.value = true
  form.value = { ...row }
  showDialog.value = true
}

const saveExam = async () => {
  saving.value = true
  const payload = {
    title: form.value.title,
    subject_id: form.value.subject_id,
    date: form.value.date,
    start_time: form.value.start_time,
    end_time: form.value.end_time,
    total_marks: form.value.total_marks,
  }

  let error
  if (isEditing.value) {
    const { error: err } = await supabase.from('exams').update(payload).eq('id', form.value.id)
    error = err
  } else {
    const { error: err } = await supabase.from('exams').insert(payload)
    error = err
  }

  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    $q.notify({ type: 'positive', message: 'Saved successfully', color: 'black' })
    showDialog.value = false
    fetchExams()
  }
  saving.value = false
}

const confirmDelete = (row) => {
  examToDelete.value = row
  showDeleteDialog.value = true
}

const deleteExam = async () => {
  deleting.value = true
  const { error } = await supabase.from('exams').delete().eq('id', examToDelete.value.id)
  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    $q.notify({ type: 'negative', message: 'Exam deleted', icon: 'delete' })
    showDeleteDialog.value = false
    fetchExams()
  }
  deleting.value = false
}

// Results Logic
const openResultsDialog = async (exam) => {
  selectedExam.value = exam
  showResultsDialog.value = true
  // Fetch all students (simplified: assume all students are candidates for now, or fetch from enrollments in future)
  // Better: Fetch all students of 'student' role, and left join with results

  // 1. Get Students
  // In a real app, filtering by enrolled subject/class is better. For now: fetch all 'student' role.
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'student')

  // 2. Get Existing Results
  const { data: results } = await supabase.from('exam_results').select('*').eq('exam_id', exam.id)

  // Merge
  if (students) {
    resultsData.value = students.map((s) => {
      const existing = results?.find((r) => r.student_id === s.id)
      return {
        student_id: s.id,
        exam_id: exam.id,
        profiles: { full_name: s.full_name },
        marks_obtained: existing ? existing.marks_obtained : null,
        grade: existing ? existing.grade : null,
        id: existing ? existing.id : null, // result record id
      }
    })
  }
}

const calculateGrade = (marks, total) => {
  if (marks === null || marks === undefined || marks === '') return null
  const percentage = (marks / total) * 100
  if (percentage >= 75) return 'A'
  if (percentage >= 65) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 35) return 'S'
  return 'F'
}

const getGradeColor = (grade) => {
  if (grade === 'A') return 'green-7'
  if (grade === 'B') return 'blue-7'
  if (grade === 'C') return 'orange-7'
  if (grade === 'S') return 'yellow-8'
  return 'red-7'
}

const saveSingleResult = async (row) => {
  if (row.marks_obtained === null || row.marks_obtained === '') return

  // Auto Calc Grade
  const grade = calculateGrade(row.marks_obtained, selectedExam.value.total_marks)
  row.grade = grade

  const payload = {
    exam_id: row.exam_id,
    student_id: row.student_id,
    marks_obtained: row.marks_obtained,
    grade: grade,
  }

  const { data, error } = await supabase
    .from('exam_results')
    .upsert(payload, { onConflict: 'exam_id, student_id' })
    .select()
    .single()

  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    // Update local id so future updates work if needed (though upsert handles it via unique key)
    if (data) row.id = data.id
  }
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}
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
.header-search {
  width: 300px;
}
</style>
