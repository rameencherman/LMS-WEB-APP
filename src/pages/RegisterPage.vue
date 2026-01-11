<template>
  <q-page class="flex flex-center bg-white font-inter text-primary relative-position">
    <q-btn
      icon="arrow_back"
      label="Back to Home"
      flat
      dense
      no-caps
      :color="$q.screen.gt.sm ? 'white' : 'black'"
      class="absolute-top-left q-ma-md z-max"
      @click="$router.push('/')"
    />
    <div
      class="row full-width full-height window-height justify-center items-center shadow-3"
      style="max-width: 100%"
    >
      <!-- Left Side: Image/Brand (Hidden on mobile) -->
      <div
        class="col-md-6 gt-sm full-height bg-black text-white flex flex-center relative-position overflow-hidden"
      >
        <div class="blob-bg absolute-center"></div>
        <div class="z-10 text-center q-pa-xl">
          <div
            class="text-h2 text-weight-bolder tracking-tighter q-mb-md cursor-pointer"
            @click="$router.push('/')"
          >
            LMS.
          </div>
          <p class="text-h5 text-grey-4">Join the Community</p>
        </div>
      </div>

      <!-- Right Side: Register Form -->
      <div class="col-12 col-md-6 flex flex-center q-pa-xl bg-white">
        <div class="full-width" style="max-width: 400px">
          <div class="text-h4 text-weight-bold q-mb-md">Create Account</div>
          <p class="text-grey-7 q-mb-xl">Start your journey with us today.</p>

          <q-form @submit="handleRegister" class="q-gutter-md">
            <q-input
              v-model="name"
              label="Full Name"
              color="black"
              outlined
              dense
              class="rounded-borders"
            />
            <q-input
              v-model="email"
              label="Email"
              color="black"
              outlined
              dense
              class="rounded-borders"
            />
            <q-input
              v-model="password"
              label="Password"
              type="password"
              color="black"
              outlined
              dense
              class="rounded-borders"
            />

            <q-btn
              unelevated
              color="black"
              text-color="white"
              label="Sign Up"
              type="submit"
              class="full-width q-py-sm rounded-borders text-weight-bold shadow-1 btn-hover-effect"
              :loading="loading"
            />

            <q-btn
              outline
              color="black"
              label="Sign up with Google"
              icon="img:https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              class="full-width q-py-sm rounded-borders q-mt-md"
              no-caps
            />

            <p class="text-center q-mt-xl text-grey-8">
              Already have an account?
              <span
                class="text-weight-bold cursor-pointer text-black"
                @click="$router.push('/login')"
                >Sign in</span
              >
            </p>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from 'boot/supabase'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

const handleRegister = async () => {
  loading.value = true
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: name.value,
      },
    },
  })

  if (error) {
    $q.notify({
      type: 'negative',
      position: 'top',
      message: error.message,
    })
  } else {
    $q.notify({
      color: 'black',
      textColor: 'white',
      icon: 'check_circle',
      position: 'top',
      message: 'Registration successful! Please check your email to confirm.',
      timeout: 5000,
    })
    router.push('/login')
  }
  loading.value = false
}
</script>

<style lang="scss" scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.rounded-borders {
  border-radius: 8px;
}
.btn-hover-effect {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}
.blob-bg {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}
</style>
