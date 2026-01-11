const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
    ],
  },

  // Dashboard Routes
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'users', component: () => import('pages/UsersPage.vue') },
      { path: 'subjects', component: () => import('pages/SubjectsPage.vue') },
      { path: 'schedule', component: () => import('pages/SchedulePage.vue') },
      { path: 'attendance', component: () => import('pages/AttendancePage.vue') },
      { path: 'exams', component: () => import('pages/ExamsPage.vue') },
      { path: 'resources', component: () => import('pages/ResourcesPage.vue') },
      { path: 'communication', component: () => import('pages/CommunicationsPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
    meta: { requiresAuth: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
