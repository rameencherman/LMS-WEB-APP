<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Resources</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Study materials and shared content.</p>
      </div>
      <div>
        <q-btn
          unelevated
          color="black"
          icon="upload_file"
          label="Add Resource"
          no-caps
          class="rounded-borders"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Filter by Subject -->
    <div class="q-mb-lg" style="max-width: 300px">
      <q-select
        outlined
        dense
        bg-color="white"
        v-model="selectedSubject"
        :options="subjectOptions"
        label="Filter by Subject"
        emit-value
        map-options
        clearable
        @update:model-value="fetchMaterials"
      />
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="black" size="2em" />
    </div>

    <div v-else-if="materials.length === 0" class="text-center q-pa-xl text-grey-7">
      <q-icon name="folder_off" size="40px" class="q-mb-sm" />
      <div>No resources found.</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4 col-lg-3" v-for="item in materials" :key="item.id">
        <q-card class="no-shadow border-gray rounded-borders column full-height">
          <q-card-section class="col">
            <div class="row items-center no-wrap q-mb-sm">
              <q-avatar
                :icon="getTypeIcon(item.type)"
                :color="getTypeColor(item.type)"
                text-color="white"
                size="sm"
                class="q-mr-sm"
              />
              <div class="text-caption text-uppercase text-grey-7 text-weight-bold">
                {{ item.subjects?.name }}
              </div>
            </div>
            <div class="text-h6 text-weight-bold ellipsis-2-lines" :title="item.title">
              {{ item.title }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs ellipsis-3-lines">
              {{ item.description }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              flat
              round
              icon="visibility"
              size="sm"
              color="grey-7"
              :href="item.file_url"
              target="_blank"
            />
            <q-btn flat round icon="edit" size="sm" color="grey-7" @click="editMaterial(item)" />
            <q-btn
              flat
              round
              icon="delete"
              size="sm"
              color="negative"
              @click="confirmDelete(item)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 500px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ isEditing ? 'Edit Resource' : 'Add New Resource' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            outlined
            dense
            v-model="form.title"
            label="Title"
            :rules="[(val) => !!val || 'Required']"
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

          <q-input
            outlined
            dense
            v-model="form.description"
            type="textarea"
            label="Description"
            rows="3"
          />

          <q-select
            outlined
            dense
            v-model="form.type"
            :options="['document', 'video', 'link']"
            label="Type"
          />

          <!-- URL Input -->
          <q-input
            outlined
            dense
            v-model="form.file_url"
            label="Link / URL"
            :rules="[(val) => !!val || 'Required']"
          >
            <template v-slot:append>
              <q-icon name="link" />
            </template>
          </q-input>

          <!-- File Upload Placeholder (simplified) -->
          <div class="text-caption text-grey">
            To upload a file, please upload to a cloud storage (or create 'materials' bucket) and
            paste the public link here.
            <br />
            <q-btn
              flat
              dense
              no-caps
              label="Click to upload file (Demo)"
              color="primary"
              @click="triggerFileUpload"
            />
            <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps color="grey-8" />
          <q-btn
            unelevated
            :label="isEditing ? 'Update' : 'Add'"
            color="black"
            no-caps
            class="rounded-borders"
            @click="saveMaterial"
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
            <div class="text-weight-bold text-h6">Delete Resource</div>
            <div class="text-grey-7">Are you sure?</div>
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
            @click="deleteMaterial"
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
const materials = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const materialToDelete = ref(null)
const subjectOptions = ref([])
const selectedSubject = ref(null)
const fileInput = ref(null)

const form = ref({
  id: null,
  title: '',
  description: '',
  type: 'document',
  file_url: '',
  subject_id: null,
})

const getTypeIcon = (type) => {
  if (type === 'video') return 'play_circle'
  if (type === 'link') return 'link'
  return 'description'
}

const getTypeColor = (type) => {
  if (type === 'video') return 'red-6'
  if (type === 'link') return 'blue-6'
  return 'orange-6'
}

onMounted(async () => {
  fetchSubjects()
  fetchMaterials()
})

const fetchSubjects = async () => {
  const { data } = await supabase.from('subjects').select('id, name')
  if (data) subjectOptions.value = data.map((s) => ({ label: s.name, value: s.id }))
}

const fetchMaterials = async () => {
  loading.value = true
  let query = supabase
    .from('materials')
    .select('*, subjects(name)')
    .order('created_at', { ascending: false })

  if (selectedSubject.value) {
    query = query.eq('subject_id', selectedSubject.value)
  }

  const { data, error } = await query
  if (error) $q.notify({ type: 'negative', message: error.message })
  else materials.value = data
  loading.value = false
}

const openCreateDialog = () => {
  isEditing.value = false
  form.value = {
    id: null,
    title: '',
    description: '',
    type: 'document',
    file_url: '',
    subject_id: null,
  }
  showDialog.value = true
}

const editMaterial = (item) => {
  isEditing.value = true
  form.value = { ...item }
  showDialog.value = true
}

const saveMaterial = async () => {
  saving.value = true
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload = {
    title: form.value.title,
    description: form.value.description,
    type: form.value.type,
    file_url: form.value.file_url,
    subject_id: form.value.subject_id,
    created_by: user?.id,
  }

  let error
  if (isEditing.value) {
    const { error: err } = await supabase.from('materials').update(payload).eq('id', form.value.id)
    error = err
  } else {
    const { error: err } = await supabase.from('materials').insert(payload)
    error = err
  }

  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    $q.notify({ type: 'positive', message: 'Resource saved', color: 'black' })
    showDialog.value = false
    fetchMaterials()
  }
  saving.value = false
}

const confirmDelete = (item) => {
  materialToDelete.value = item
  showDeleteDialog.value = true
}

const deleteMaterial = async () => {
  deleting.value = true
  const { error } = await supabase.from('materials').delete().eq('id', materialToDelete.value.id)
  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    $q.notify({ type: 'negative', message: 'Deleted', icon: 'delete' })
    showDeleteDialog.value = false
    fetchMaterials()
  }
  deleting.value = false
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  saving.value = true

  // Simple path
  const fileName = `${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from('materials').upload(fileName, file)

  if (error) {
    $q.notify({ type: 'negative', message: 'Upload Failed: ' + error.message })
  } else {
    // Get URL
    const { data: urlData } = supabase.storage.from('materials').getPublicUrl(fileName)
    if (urlData) {
      form.value.file_url = urlData.publicUrl
      $q.notify({ type: 'positive', message: 'Uploaded successfully!' })
    }
  }
  saving.value = false
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
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
