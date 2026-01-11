<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Subjects</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Manage courses and learning modules.</p>
      </div>
      <div>
        <q-btn
          unelevated
          color="black"
          icon="add_circle"
          label="Add Subject"
          no-caps
          class="rounded-borders"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <q-card class="no-shadow border-gray rounded-borders bg-white">
      <div class="q-pa-md row items-center justify-between border-bottom">
        <div class="text-h6 text-weight-bold">All Subjects</div>
        <q-input
          outlined
          dense
          v-model="filter"
          placeholder="Search subjects..."
          class="rounded-borders header-search"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-table
        :rows="subjects"
        :columns="columns"
        row-key="id"
        :filter="filter"
        flat
        class="font-inter"
        :loading="loading"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              flat
              round
              icon="edit"
              size="sm"
              color="grey-7"
              @click="editSubject(props.row)"
            />
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

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ isEditing ? 'Edit Subject' : 'Add New Subject' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            outlined
            dense
            v-model="form.name"
            label="Subject Name"
            :rules="[(val) => !!val || 'Name is required']"
          />
          <q-input outlined dense v-model="form.code" label="Subject Code (optional)" />
          <q-input
            outlined
            dense
            v-model="form.description"
            label="Description"
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps color="grey-8" />
          <q-btn
            unelevated
            :label="isEditing ? 'Update' : 'Create'"
            color="black"
            no-caps
            class="rounded-borders"
            @click="saveSubject"
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
            <div class="text-weight-bold text-h6">Delete Subject</div>
            <div class="text-grey-7">Are you sure? This action cannot be undone.</div>
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
            @click="deleteSubject"
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
const subjects = ref([])
const loading = ref(false)
const filter = ref('')
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const form = ref({ id: null, name: '', code: '', description: '' })
const subjectToDelete = ref(null)

const columns = [
  { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
  { name: 'code', label: 'Code', align: 'left', field: 'code', sortable: true },
  { name: 'description', label: 'Description', align: 'left', field: 'description' },
  { name: 'actions', label: 'Actions', align: 'right' },
]

const fetchSubjects = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) $q.notify({ type: 'negative', message: error.message })
  else subjects.value = data
  loading.value = false
}

const openCreateDialog = () => {
  isEditing.value = false
  form.value = { id: null, name: '', code: '', description: '' }
  showDialog.value = true
}

const editSubject = (subject) => {
  isEditing.value = true
  form.value = { ...subject }
  showDialog.value = true
}

const saveSubject = async () => {
  if (!form.value.name) return
  saving.value = true

  let error
  if (isEditing.value) {
    const { error: err } = await supabase
      .from('subjects')
      .update({
        name: form.value.name,
        code: form.value.code,
        description: form.value.description,
      })
      .eq('id', form.value.id)
    error = err
  } else {
    const { error: err } = await supabase.from('subjects').insert({
      name: form.value.name,
      code: form.value.code,
      description: form.value.description,
    })
    error = err
  }

  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  } else {
    $q.notify({ type: 'positive', message: 'Saved successfully', color: 'black' })
    showDialog.value = false
    fetchSubjects()
  }
  saving.value = false
}

const confirmDelete = (subject) => {
  subjectToDelete.value = subject
  showDeleteDialog.value = true
}

const deleteSubject = async () => {
  deleting.value = true
  const { error } = await supabase.from('subjects').delete().eq('id', subjectToDelete.value.id)
  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  } else {
    $q.notify({ type: 'negative', message: 'Subject deleted', icon: 'delete' })
    showDeleteDialog.value = false
    fetchSubjects()
  }
  deleting.value = false
}

onMounted(() => {
  fetchSubjects()
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
.header-search {
  width: 300px;
}
</style>
