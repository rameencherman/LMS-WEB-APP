<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Users & Roles</h1>
        <p class="text-grey-7 q-mt-sm text-body1">Manage system access and permissions.</p>
      </div>
      <div class="q-gutter-sm">
        <q-btn
          unelevated
          color="white"
          text-color="black"
          icon="person_add"
          label="Invite User"
          no-caps
          class="rounded-borders border-gray"
          @click="showInviteDialog = true"
        />
        <q-btn
          unelevated
          color="black"
          icon="add_circle"
          label="Create User"
          no-caps
          class="rounded-borders"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <q-card class="no-shadow border-gray rounded-borders bg-white">
      <div class="q-pa-md row items-center justify-between border-bottom">
        <div class="text-h6 text-weight-bold">All Users</div>
        <q-input
          outlined
          dense
          v-model="filter"
          placeholder="Search users..."
          class="rounded-borders header-search"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :filter="filter"
        flat
        class="font-inter"
        :loading="loading"
      >
        <template v-slot:body-cell-full_name="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="32px" class="bg-grey-2 q-mr-sm" text-color="black">
                <span class="text-weight-bold text-caption">{{
                  getInitials(props.row.full_name)
                }}</span>
              </q-avatar>
              {{ props.row.full_name }}
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <q-chip
              :color="getRoleColor(props.row.role)"
              text-color="white"
              size="sm"
              class="text-weight-bold uppercase-chip"
            >
              {{ props.row.role }}
            </q-chip>
            <q-btn flat round icon="edit" size="xs" color="grey-7" @click="editUser(props.row)" />
            <q-btn
              flat
              round
              icon="delete"
              size="xs"
              color="negative"
              class="q-ml-sm"
              @click="confirmDeleteUser(props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            {{ new Date(props.row.created_at).toLocaleDateString() }}
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Edit User Dialog -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Edit User Details</div>
          <div class="text-caption text-grey-7">Update information for {{ editForm.email }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            outlined
            dense
            v-model="editForm.full_name"
            label="Full Name"
            color="black"
            class="rounded-borders"
          />
          <q-select
            outlined
            v-model="editForm.role"
            :options="roleOptions"
            label="Role"
            dense
            color="black"
            class="rounded-borders"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup color="grey-8" no-caps />
          <q-btn
            unelevated
            label="Save Changes"
            color="black"
            no-caps
            class="rounded-borders"
            @click="updateUser"
            :loading="updating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Create User Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Create New User</div>
          <div class="text-caption text-grey-7">Manually create a new user account.</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="newUser.firstName"
                label="First Name"
                class="rounded-borders"
                color="black"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="newUser.lastName"
                label="Last Name"
                class="rounded-borders"
                color="black"
              />
            </div>
          </div>
          <q-input
            outlined
            dense
            v-model="newUser.email"
            label="Email Address"
            class="rounded-borders"
            color="black"
          />
          <q-input
            outlined
            dense
            v-model="newUser.password"
            label="Password"
            type="password"
            class="rounded-borders"
            color="black"
          />
          <q-select
            outlined
            dense
            v-model="newUser.role"
            :options="roleOptions"
            label="Role"
            class="rounded-borders"
            color="black"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Cancel" v-close-popup color="grey-8" no-caps />
          <q-btn
            unelevated
            label="Create Account"
            color="black"
            no-caps
            class="rounded-borders"
            @click="createUser"
            :loading="creating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px" class="rounded-borders">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red-1" text-color="negative" />
          <div class="q-ml-md">
            <div class="text-weight-bold text-h6">Delete User</div>
            <div class="text-grey-7">Are you sure? This removes accessibility for this user.</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup color="grey-8" no-caps />
          <q-btn
            unelevated
            label="Delete User"
            color="negative"
            no-caps
            class="rounded-borders"
            @click="deleteUser"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Invite Dialog (Placeholder) -->
    <q-dialog v-model="showInviteDialog">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Invite New User</div>
          <div class="text-caption text-grey-7">Send an invitation email to join the LMS.</div>
        </q-card-section>
        <q-card-section>
          <q-input
            outlined
            dense
            placeholder="Email Address"
            v-model="inviteEmail"
            class="q-mb-md rounded-borders"
          />
          <q-select
            outlined
            dense
            v-model="inviteRole"
            :options="roleOptions"
            label="Role"
            class="rounded-borders"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup color="grey-8" no-caps />
          <q-btn
            unelevated
            label="Send Invitation"
            color="black"
            no-caps
            class="rounded-borders"
            @click="inviteUser"
            :loading="inviting"
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
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
const users = ref([])
const loading = ref(true)
const filter = ref('')
const showEditDialog = ref(false)
const showInviteDialog = ref(false)
const showCreateDialog = ref(false)
const updating = ref(false)
const creating = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('student')
const inviting = ref(false)

const inviteUser = async () => {
  if (!inviteEmail.value) {
    $q.notify({ type: 'warning', message: 'Please enter an email' })
    return
  }
  inviting.value = true
  // Logic: Send Magic Link which also acts as signup if enabled
  const { error } = await supabase.auth.signInWithOtp({
    email: inviteEmail.value,
    options: {
      data: { role: inviteRole.value },
    },
  })

  if (error) {
    $q.notify({ type: 'negative', message: error.message })
  } else {
    $q.notify({
      color: 'black',
      textColor: 'white',
      icon: 'check_circle',
      message: `Invitation link sent to ${inviteEmail.value}`,
    })
    showInviteDialog.value = false
    inviteEmail.value = ''
  }
  inviting.value = false
}

const showDeleteDialog = ref(false)
const userToDelete = ref(null)
const deleting = ref(false)

const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'student',
})

const editForm = ref({
  id: null,
  full_name: '',
  role: '',
  email: '',
})

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  deleting.value = true

  const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.value.id)

  if (error) {
    $q.notify({ type: 'negative', position: 'top', message: error.message })
  } else {
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'delete',
      position: 'top',
      message: 'User deleted successfully',
    })
    // Remove from local list
    users.value = users.value.filter((u) => u.id !== userToDelete.value.id)
    showDeleteDialog.value = false
  }
  deleting.value = false
}

const createUser = async () => {
  creating.value = true
  const { error } = await supabase.auth.signUp({
    email: newUser.value.email,
    password: newUser.value.password,
    options: {
      data: {
        full_name: `${newUser.value.firstName} ${newUser.value.lastName}`,
        role: newUser.value.role, // Note: This needs backend trigger to respect role, which we added.
      },
    },
  })

  if (error) {
    $q.notify({ type: 'negative', position: 'top', message: error.message })
  } else {
    $q.notify({
      color: 'black',
      textColor: 'white',
      icon: 'check_circle',
      position: 'top',
      message: 'User created successfully! (Please note: You might be logged in as new user)',
    })
    showCreateDialog.value = false
    // Refresh list
    fetchUsers()
  }
  creating.value = false
}

const roleOptions = ['admin', 'teacher', 'student', 'parent']

const columns = [
  {
    name: 'full_name',
    required: true,
    label: 'Full Name',
    align: 'left',
    field: 'full_name',
    sortable: true,
  },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'role', align: 'left', label: 'Role', field: 'role', sortable: true },
  { name: 'created_at', align: 'right', label: 'Joined', field: 'created_at', sortable: true },
]

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'black'
    case 'teacher':
      return 'deep-purple-6'
    case 'student':
      return 'blue-6'
    case 'parent':
      return 'orange-8'
    default:
      return 'grey'
  }
}

const fetchUsers = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    $q.notify({ type: 'negative', position: 'top', message: 'Error fetching users' })
  } else {
    users.value = data
  }
  loading.value = false
}

const editUser = (user) => {
  editForm.value = { ...user }
  showEditDialog.value = true
}

const updateUser = async () => {
  if (!editForm.value.id) return
  updating.value = true

  const { error } = await supabase
    .from('profiles')
    .update({
      role: editForm.value.role,
      full_name: editForm.value.full_name,
    })
    .eq('id', editForm.value.id)

  if (error) {
    $q.notify({ type: 'negative', position: 'top', message: error.message })
  } else {
    $q.notify({
      color: 'black',
      textColor: 'white',
      icon: 'check_circle',
      position: 'top',
      message: 'User updated successfully',
    })
    // Update local state
    const index = users.value.findIndex((u) => u.id === editForm.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...editForm.value }
    }
    showEditDialog.value = false
  }
  updating.value = false
}

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

onMounted(() => {
  if (route.query.q) {
    filter.value = route.query.q
  }
  fetchUsers()
})
</script>

<style lang="scss" scoped>
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
.uppercase-chip {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
}
</style>
