<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header class="bg-white text-black bordered border-bottom">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold font-inter text-h6"> Dashboard </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <q-select
            outlined
            dense
            use-input
            hide-selected
            fill-input
            input-debounce="300"
            v-model="selectedSearch"
            :options="filteredOptions"
            @filter="filterSearch"
            @update:model-value="handleSearchNavigation"
            placeholder="Search pages or users..."
            class="rounded-borders hidden-xs"
            style="min-width: 300px"
            bg-color="grey-1"
            borderless
            option-label="label"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results found </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-btn flat round dense icon="notifications" size="sm" />
          <q-avatar size="32px" class="cursor-pointer bg-grey-2">
            <span class="text-black text-weight-bold text-caption">{{ userInitials }}</span>
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="$router.push('/dashboard/profile')">
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section class="text-negative">Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar (Drawer) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-black text-white" :width="260">
      <div class="q-pa-md flex items-center q-mb-md">
        <div class="text-h4 text-weight-bolder tracking-tighter text-white">LMS.</div>
        <div class="bg-white q-ml-xs" style="width: 6px; height: 6px; border-radius: 50%"></div>
      </div>

      <q-list class="q-px-sm">
        <q-item
          v-for="link in statsLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.link"
          :exact="link.exact"
          class="rounded-borders q-mb-xs text-grey-5 hover:text-white"
          active-class="bg-grey-9 text-white"
        >
          <q-item-section avatar min-width="0">
            <q-icon :name="link.icon" size="20px" />
          </q-item-section>
          <q-item-section>
            <div class="text-weight-medium">{{ link.title }}</div>
          </q-item-section>
        </q-item>

        <q-separator color="grey-9" class="q-my-md" />

        <q-item
          clickable
          v-ripple
          class="rounded-borders text-grey-5 hover:text-white"
          @click="handleLogout"
        >
          <q-item-section avatar>
            <q-icon name="logout" size="20px" />
          </q-item-section>
          <q-item-section>
            <div class="text-weight-medium">Logout</div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'

const leftDrawerOpen = ref(false)
const router = useRouter()
const userProfile = ref(null)

const selectedSearch = ref(null)
const filteredOptions = ref([])

const staticOptions = [
  { label: 'Dashboard', icon: 'dashboard', description: 'Main overview', link: '/dashboard' },
  { label: 'Subjects', icon: 'book', description: 'Manage courses', link: '/dashboard/subjects' },
  {
    label: 'Class Schedule',
    icon: 'event',
    description: 'Weekly Timetable',
    link: '/dashboard/schedule',
  },
  {
    label: 'Attendance',
    icon: 'how_to_reg',
    description: 'Mark student attendance',
    link: '/dashboard/attendance',
  },
  {
    label: 'Exams',
    icon: 'assessment',
    description: 'Exam schedules & results',
    link: '/dashboard/exams',
  },
  {
    label: 'Resources',
    icon: 'folder',
    description: 'Study Materials',
    link: '/dashboard/resources',
  },
  {
    label: 'Communication',
    icon: 'forum',
    description: 'Notices & Messages',
    link: '/dashboard/communication',
  },
  {
    label: 'Users & Roles',
    icon: 'group',
    description: 'Manage system users',
    link: '/dashboard/users',
  },
  { label: 'Settings', icon: 'settings', description: 'My settings', link: '/dashboard/settings' },
  {
    label: 'Profile',
    icon: 'account_circle',
    description: 'My profile details',
    link: '/dashboard/profile',
  },
]

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const filterSearch = (val, update) => {
  if (val === '') {
    update(() => {
      filteredOptions.value = staticOptions
    })
    return
  }

  update(async () => {
    const needle = val.toLowerCase()

    // Filter Static
    const staticResults = staticOptions.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)

    // Filter Users (Async)
    let userResults = []
    if (needle.length > 2) {
      // Note: Assuming Supabase access is allowed. If blocked by RLS, it handles gracefully (empty)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .ilike('full_name', `%${val}%`)
        .limit(3)

      if (data) {
        userResults = data.map((u) => ({
          label: u.full_name,
          icon: 'person',
          description: `User • ${u.role}`,
          link: null, // Custom handling
          isUser: true,
        }))
      }
    }

    filteredOptions.value = [...staticResults, ...userResults]
  })
}

const handleSearchNavigation = (item) => {
  if (!item) return
  if (item.link) {
    router.push(item.link)
  } else if (item.isUser) {
    // Navigate to users page with search filter
    router.push({ path: '/dashboard/users', query: { q: item.label } })
  }
}

const statsLinks = [
  { title: 'Dashboard', icon: 'dashboard', link: '/dashboard', exact: true },
  { title: 'Subjects', icon: 'book', link: '/dashboard/subjects', exact: false },
  { title: 'Class Schedule', icon: 'event', link: '/dashboard/schedule', exact: false },
  { title: 'Attendance', icon: 'how_to_reg', link: '/dashboard/attendance', exact: false },
  { title: 'Exams', icon: 'assessment', link: '/dashboard/exams', exact: false },
  { title: 'Resources', icon: 'folder', link: '/dashboard/resources', exact: false },
  { title: 'Communication', icon: 'forum', link: '/dashboard/communication', exact: false },
  { title: 'Users & Roles', icon: 'group', link: '/dashboard/users', exact: false },
  { title: 'Settings', icon: 'settings', link: '/dashboard/settings', exact: false },
]

const userInitials = computed(() => {
  if (!userProfile.value || !userProfile.value.full_name) return 'JD'
  const names = userProfile.value.full_name.split(' ')
  if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase()
  return names[0].substring(0, 2).toUpperCase()
})

const getProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    // Try fetch profile
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) userProfile.value = data
    else userProfile.value = user.user_metadata // Fallback
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(() => {
  getProfile()
})
</script>

<style lang="scss" scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
:deep(.q-drawer) {
  border-right: 1px solid #333;
}
</style>
