<template>
  <q-page class="bg-white text-primary font-inter">
    <!-- Navbar (Dark Theme) -->
    <div
      class="q-pt-lg q-px-xl flex justify-between items-center animate-fade-in bg-black text-white"
    >
      <div class="row items-center cursor-pointer">
        <div class="text-h4 text-weight-bolder tracking-tighter">LMS</div>
        <div class="bg-white q-ml-xs" style="width: 8px; height: 8px; border-radius: 50%"></div>
      </div>
      <div class="q-gutter-md gt-sm display-flex items-center">
        <q-btn flat no-caps label="Features" class="text-weight-medium" />
        <q-btn flat no-caps label="Solutions" class="text-weight-medium" />
        <q-btn flat no-caps label="About" class="text-weight-medium" />
      </div>
      <div v-if="!user" class="q-gutter-sm">
        <q-btn
          flat
          no-caps
          label="Login"
          class="text-white text-weight-bold font-size-16"
          @click="$router.push('/login')"
        />
        <q-btn
          unelevated
          color="white"
          text-color="black"
          label="Get Started"
          no-caps
          class="q-px-lg rounded-borders text-weight-bold"
          @click="$router.push('/register')"
        />
      </div>
      <div v-else class="row items-center q-gutter-sm">
        <q-btn-dropdown
          flat
          no-caps
          :label="user.email ? user.email.split('@')[0] : 'User'"
          class="text-white text-weight-bold"
          content-class="bg-white text-black"
        >
          <q-list class="min-w-200">
            <q-item clickable v-close-popup @click="$router.push('/dashboard')">
              <q-item-section avatar>
                <q-icon name="dashboard" color="black" />
              </q-item-section>
              <q-item-section>Dashboard</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section class="text-negative">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Hero Section (Dark Theme) -->
    <section
      class="row items-center q-px-xl q-pb-xl responsive-section bg-black text-white"
      style="min-height: 85vh"
    >
      <div class="col-12 col-md-6 q-pr-md-xl animate-slide-up feature-text-col">
        <div
          class="q-mb-md inline-block bg-grey-9 q-px-md q-py-xs rounded-borders text-caption text-weight-bold tracking-wide text-white"
          style="border: 1px solid #333"
        >
          100% FREE & OPEN SOURCE
        </div>
        <h1 class="text-weight-900 q-mt-none q-mb-md hero-title">
          The Future of <br />
          <span class="text-stroke-white">Smart Learning</span>
        </h1>
        <p class="text-h6 text-grey-5 q-mb-xl hero-subtitle">
          An all-in-one intuition management system designed for maximum efficiency. Streamline
          attendance, payments, and learning in one sleek dashboard.
        </p>
        <div class="row q-gutter-md hero-btn-container">
          <q-btn
            unelevated
            color="white"
            text-color="black"
            size="lg"
            label="Get Started Free"
            no-caps
            class="q-px-xl rounded-borders shadow-10 btn-hover-effect"
            icon-right="arrow_forward"
            @click="$router.push('/register')"
          />
          <q-btn
            outline
            color="white"
            size="lg"
            label="View Demo"
            no-caps
            class="q-px-xl rounded-borders btn-hover-effect"
          />
        </div>

        <div class="row q-mt-xl items-center q-gutter-lg opacity-60">
          <div class="text-caption text-grey-5">POWERED BY</div>
          <div class="text-weight-bold text-h6 text-white">OPEN SOURCE COMMUNITY</div>
        </div>
      </div>

      <div class="col-12 col-md-6 flex flex-center animate-scale-in position-relative">
        <div class="blob-bg absolute-center"></div>
        <q-img src="~assets/tuition_management_hero.png" class="hero-image invert-filter" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="responsive-section bg-grey-1 section-spacer">
      <div class="row justify-between items-end q-mb-xl">
        <div class="col-12 col-md-8">
          <h2 class="text-h3 text-weight-bold q-mb-sm text-black">
            Everything you need,<br />in one place.
          </h2>
        </div>
        <div class="col-12 col-md-4 text-right gt-sm">
          <q-btn
            flat
            label="View all features"
            icon-right="arrow_forward"
            no-caps
            class="text-weight-bold text-black"
          />
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-4" v-for="feature in features" :key="feature.title">
          <q-card
            class="feature-card full-height q-pa-lg column justify-between rounded-borders bg-white shadow-3"
          >
            <div>
              <div
                class="q-mb-lg bg-grey-1 row flex-center rounded-circle"
                style="width: 70px; height: 70px"
              >
                <q-icon :name="feature.icon" size="32px" color="black" />
              </div>
              <div class="text-h5 text-weight-bold q-mb-md text-black">{{ feature.title }}</div>
              <p class="text-grey-8 text-body1" style="line-height: 1.6">{{ feature.desc }}</p>
            </div>
            <div class="q-mt-lg">
              <q-btn
                flat
                class="q-px-none"
                label="Learn more"
                no-caps
                icon-right="arrow_forward"
                color="black"
              />
            </div>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Dashboard Preview Section -->
    <section class="responsive-section bg-black text-white">
      <div class="row items-center q-col-gutter-xl reverse-wrap-md">
        <div class="col-12 col-md-6 animate-scale-in">
          <q-img
            src="~assets/lms_dashboard_preview.png"
            class="dashboard-preview-img rounded-borders shadow-5 invert-filter"
          />
        </div>
        <div class="col-12 col-md-6 q-pl-md-xl">
          <div class="text-overline text-weight-bold text-grey-5 q-mb-sm">POWERFUL ANALYTICS</div>
          <h2 class="text-h3 text-weight-bold q-mb-md">Data-driven decisions,<br />made easy.</h2>
          <p class="text-h6 text-grey-4 q-mb-lg font-light">
            Visualize your institute's performance with our advanced dashboard. Track growth,
            monitor student progress, and manage resources effortlessly.
          </p>
          <ul class="q-pl-none q-mt-md text-body1 text-grey-4 list-none">
            <li class="q-mb-md flex items-center">
              <q-icon name="check_circle" color="white" size="sm" class="q-mr-sm" />
              Real-time financial reports
            </li>
            <li class="q-mb-md flex items-center">
              <q-icon name="check_circle" color="white" size="sm" class="q-mr-sm" />
              Student performance tracking
            </li>
            <li class="flex items-center">
              <q-icon name="check_circle" color="white" size="sm" class="q-mr-sm" />
              Automated attendance insights
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section
      class="responsive-margin rounded-corners bg-grey-2 text-black q-pa-xl relative-position overflow-hidden"
    >
      <div
        class="absolute-right full-height"
        style="width: 50%; background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05))"
      ></div>
      <div class="row items-center relative-position z-10">
        <div class="col-12 col-md-7">
          <h2 class="text-h3 text-weight-bold q-mb-md">Open Source & Free Forever.</h2>
          <p class="text-h6 text-grey-8 q-mb-lg">
            Join the community of developers and educators building the future of learning.
          </p>
          <div class="row q-gutter-md">
            <q-btn
              unelevated
              color="black"
              text-color="white"
              size="lg"
              label="Get Started"
              no-caps
              class="q-px-xl rounded-borders btn-hover-effect text-weight-bold"
            />
            <q-btn
              outline
              color="black"
              size="lg"
              label="Contribute on GitHub"
              no-caps
              class="q-px-xl rounded-borders"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="q-px-xl q-py-xl responsive-section bg-white text-secondary border-top">
      <div class="row justify-between">
        <div class="col-12 col-md-4">
          <div class="text-h5 text-weight-bolder text-black q-mb-sm">LMS.</div>
          <p>The advanced platform for modern education and tuition management.</p>
        </div>
        <div class="col-12 col-md-6 row justify-end q-gutter-xl">
          <div class="column q-gutter-sm">
            <div class="text-weight-bold text-black q-mb-xs">PRODUCT</div>
            <a href="#" class="footer-link">Features</a>
            <a href="#" class="footer-link">Demo</a>
          </div>
          <div class="column q-gutter-sm">
            <div class="text-weight-bold text-black q-mb-xs">COMPANY</div>
            <a href="#" class="footer-link">About</a>
            <a href="#" class="footer-link">Contact</a>
            <a href="#" class="footer-link">Privacy</a>
          </div>
        </div>
      </div>
      <div class="q-mt-xl q-pt-md border-top-light row justify-between items-center text-caption">
        <div>
          &copy; 2024 LMS Inc. All rights reserved.
          <span class="q-ml-sm text-grey-6">Powered by MRWEB DIGITAL</span>
        </div>
        <div class="row q-gutter-sm">
          <q-icon name="language" size="xs" />
          <span>English (US)</span>
        </div>
      </div>
    </footer>

    <!-- Scroll to Top -->
    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary" text-color="white" />
    </q-page-scroller>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'

const features = [
  {
    title: 'Smart Attendance',
    desc: 'Seamlessly track student attendance with QR technology and real-time syncing. Say goodbye to manual registers.',
    icon: 'qr_code_scanner',
  },
  {
    title: 'Payment Processing',
    desc: 'Automate fee collections, generate professional invoices, and track financial health effortlessly with auto-reminders.',
    icon: 'payments',
  },
  {
    title: 'Deep Analytics',
    desc: 'Gain powerful insights into student performance and business growth with interactive, real-time charts.',
    icon: 'insights',
  },
]

const user = ref(null)

onMounted(async () => {
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  user.value = currentUser

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  // window.location.reload() // Optional: reload to clear any state if needed
}
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

// Responsive container spacing
.responsive-section {
  padding-left: 48px;
  padding-right: 48px;
  padding-top: 64px;
  padding-bottom: 64px;
  @media (max-width: $breakpoint-sm-max) {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 40px;
    padding-bottom: 40px;
  }
}

.responsive-margin {
  margin: 48px;
  @media (max-width: $breakpoint-sm-max) {
    margin: 24px;
    padding: 24px !important; // Adjust internal padding of CTA on mobile
  }
}

// Navbar responsiveness
.q-pt-lg {
  @media (max-width: $breakpoint-sm-max) {
    padding-top: 16px !important;
  }
}
.q-px-xl {
  // Overriding general Quasar padding for this page specifically if needed, but better to use responsive-section
  @media (max-width: $breakpoint-sm-max) {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}

.hero-title {
  font-size: 4.5rem;
  line-height: 1.05;
  letter-spacing: -2px;
  @media (max-width: $breakpoint-md-max) {
    font-size: 3.5rem;
  }
  @media (max-width: $breakpoint-sm-max) {
    font-size: 2.5rem;
    line-height: 1.2;
  }
}

.feature-text-col {
  @media (max-width: $breakpoint-sm-max) {
    text-align: center;
    margin-bottom: 2rem;
    padding-right: 0 !important; // Remove right padding on mobile
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.hero-btn-container {
  @media (max-width: $breakpoint-sm-max) {
    justify-content: center;
    margin-left: 0 !important; // Override q-gutter margin if needed
    width: 100%;
  }
}

.text-stroke-white {
  -webkit-text-stroke: 2px white;
  color: transparent;
}
.hero-subtitle {
  font-weight: 300;
  line-height: 1.6;
  max-width: 550px;
  @media (max-width: $breakpoint-sm-max) {
    margin-left: auto;
    margin-right: auto;
    font-size: 1rem !important;
  }
}
.rounded-borders {
  border-radius: 12px;
}
.rounded-corners {
  border-radius: 32px;
}
.rounded-circle {
  border-radius: 50%;
}
.list-none {
  list-style: none;
}

.btn-hover-effect {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.15);
  }
}

.feature-card {
  transition: all 0.4s ease;
  border: 1px solid transparent;
  &:hover {
    background: white;
    border-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    transform: translateY(-5px);
  }
}

.footer-link {
  text-decoration: none;
  color: #757575;
  transition: color 0.2s;
  &:hover {
    color: #000;
  }
}

.border-top {
  border-top: 1px solid #f0f0f0;
}
.border-top-light {
  border-top: 1px solid #f5f5f5;
}

// Animations
.animate-spread-in {
  animation: fadeIn 1.2s ease;
}
.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}
.animate-scale-in {
  animation: scaleIn 1s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hero-image {
  max-width: 120%;
  filter: grayscale(100%) invert(1);
  transition: filter 0.5s;
  opacity: 0.9;
  @media (max-width: $breakpoint-sm-max) {
    max-width: 100%;
    margin-top: 20px;
  }
  &:hover {
    filter: grayscale(0%) invert(1);
    opacity: 1;
  }
}

.invert-filter {
  filter: invert(1) grayscale(100%);
}

.dashboard-preview-img {
  transition: transform 0.5s ease;
  @media (max-width: $breakpoint-sm-max) {
    margin-bottom: 24px;
  }
  &:hover {
    transform: perspective(1000px) rotateY(-5deg);
  }
}

.blob-bg {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  z-index: -1;
  @media (max-width: $breakpoint-sm-max) {
    width: 300px;
    height: 300px;
  }
}
.min-w-200 {
  min-width: 200px;
}
</style>
