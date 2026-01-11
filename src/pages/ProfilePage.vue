<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row q-col-gutter-lg justify-center">
      <!-- Profile Card -->
      <div class="col-12 col-md-4">
        <q-card
          class="no-shadow border-gray rounded-borders text-center q-pa-lg bg-white h-full relative-position"
        >
          <div class="absolute-top-right q-pa-md">
            <q-btn flat round icon="edit" color="grey-7" size="sm" />
          </div>

          <div class="q-mt-md q-mb-lg flex flex-center">
            <q-avatar size="120px" class="bg-grey-2 shadow-2 relative-position">
              <span class="text-h3 text-weight-bold text-grey-6" v-if="!avatarUrl">{{
                userInitials
              }}</span>
              <img v-else :src="avatarUrl" />

              <q-btn
                fab-mini
                color="black"
                icon="camera_alt"
                class="absolute-bottom-right"
                style="bottom: 0px; right: 0px"
                @click="triggerFileSelect"
              />
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                @change="handleFileUpload"
                accept="image/*"
              />
            </q-avatar>
          </div>

          <div class="text-h5 text-weight-bold q-mb-xs">{{ fullName || 'User Name' }}</div>
          <div class="text-grey-7 q-mb-md">{{ email }}</div>

          <q-chip
            color="green-1"
            text-color="green-9"
            icon="verified"
            label="Active Account"
            class="font-weight-bold"
          />

          <div class="q-mt-xl text-left">
            <div class="text-caption text-grey-7 text-weight-bold q-mb-sm text-uppercase">Role</div>
            <div class="text-body1 q-mb-md flex items-center">
              <q-icon name="school" class="q-mr-sm" color="grey-7" /> Administrator
            </div>

            <div class="text-caption text-grey-7 text-weight-bold q-mb-sm text-uppercase">
              Joined
            </div>
            <div class="text-body1 flex items-center">
              <q-icon name="calendar_today" class="q-mr-sm" color="grey-7" /> {{ joinDate }}
            </div>
          </div>
        </q-card>
      </div>

      <!-- Edit details form -->
      <div class="col-12 col-md-8">
        <q-card class="no-shadow border-gray rounded-borders q-pa-lg bg-white">
          <div class="text-h6 text-weight-bold q-mb-lg">Personal Information</div>

          <q-form @submit="updateProfile" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">First Name</label>
                <q-input
                  outlined
                  v-model="form.firstName"
                  dense
                  color="black"
                  class="rounded-borders"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">Last Name</label>
                <q-input
                  outlined
                  v-model="form.lastName"
                  dense
                  color="black"
                  class="rounded-borders"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">Email Address</label>
                <q-input
                  outlined
                  v-model="email"
                  dense
                  readonly
                  color="grey-7"
                  class="rounded-borders bg-grey-1"
                  hint="Email cannot be changed"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">Phone Number</label>
                <q-input
                  outlined
                  v-model="form.phone"
                  dense
                  color="black"
                  class="rounded-borders"
                  mask="###-#######"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">About / Bio</label>
                <q-input
                  outlined
                  v-model="form.bio"
                  type="textarea"
                  dense
                  color="black"
                  class="rounded-borders"
                  rows="4"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-lg">
              <q-btn label="Cancel" flat color="grey-8" class="q-mr-sm text-weight-bold" no-caps />
              <q-btn
                label="Save Changes"
                unelevated
                color="black"
                type="submit"
                class="q-px-lg rounded-borders text-weight-bold"
                no-caps
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card>

        <q-card class="no-shadow border-gray rounded-borders q-pa-lg bg-white q-mt-lg">
          <div class="text-h6 text-weight-bold q-mb-md text-negative">Danger Zone</div>
          <p class="text-grey-7">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <q-btn
            outline
            color="negative"
            label="Delete Account"
            no-caps
            class="rounded-borders text-weight-bold"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const email = ref('')
const avatarUrl = ref(null)
const joinDate = ref('')
const fileInput = ref(null)
const userId = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  bio: '',
})

const userInitials = computed(() => {
  const f = form.value.firstName ? form.value.firstName[0] : ''
  const l = form.value.lastName ? form.value.lastName[0] : ''
  return (f + l).toUpperCase() || 'U'
})

const fullName = computed(() => {
  return `${form.value.firstName} ${form.value.lastName}`.trim()
})

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    userId.value = user.id
    email.value = user.email
    joinDate.value = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Fetch profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (profile) {
      // Parse full_name
      const names = (profile.full_name || '').split(' ')
      form.value.firstName = names[0] || ''
      form.value.lastName = names.slice(1).join(' ') || ''

      form.value.bio = profile.bio || ''
      form.value.phone = profile.phone || '' // Assuming phone column exists, otherwise it will just be ignored
      avatarUrl.value = profile.avatar_url
    } else {
      // Fallback to metadata
      const metaName = user.user_metadata?.full_name || ''
      const names = metaName.split(' ')
      form.value.firstName = names[0] || ''
      form.value.lastName = names.slice(1).join(' ') || ''
    }
  }
})

const updateProfile = async () => {
  loading.value = true

  const updates = {
    full_name: fullName.value,
    bio: form.value.bio,
    // phone: form.value.phone // Uncomment if column exists
    updated_at: new Date(),
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId.value)

  if (error) {
    $q.notify({ type: 'negative', position: 'top', message: error.message })
  } else {
    // Also update Auth metadata for consistency if needed
    await supabase.auth.updateUser({ data: { full_name: fullName.value } })

    $q.notify({
      color: 'black',
      textColor: 'white',
      icon: 'check_circle',
      position: 'top',
      message: 'Profile updated successfully',
    })
  }
  loading.value = false
}

const triggerFileSelect = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  loading.value = true
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId.value}/avatar.${fileExt}`

  // Upload
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    $q.notify({ type: 'negative', message: 'Upload failed: ' + uploadError.message })
    loading.value = false
    return
  }

  // Get URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

  if (data) {
    avatarUrl.value = data.publicUrl
    // Update profile
    await supabase.from('profiles').update({ avatar_url: avatarUrl.value }).eq('id', userId.value)
    $q.notify({ type: 'positive', message: 'Avatar updated!' })
  }

  loading.value = false
}
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
