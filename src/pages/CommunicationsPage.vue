<template>
  <q-page class="q-pa-lg font-inter bg-grey-1">
    <!-- Notices Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">Notice Board</div>
      <q-btn
        v-if="canManage"
        unelevated
        color="black"
        label="Post Notice"
        icon="add"
        no-caps
        @click="openNoticeDialog"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12" v-if="notices.length === 0">
        <q-banner class="bg-white rounded-borders text-center text-grey-8">
          No active announcements.
        </q-banner>
      </div>
      <div class="col-12 col-md-6 col-lg-4" v-for="notice in notices" :key="notice.id">
        <q-card class="no-shadow border-gray rounded-borders h-100 column">
          <q-card-section class="bg-grey-2 row items-center justify-between q-py-sm">
            <div class="text-caption text-weight-bold row items-center">
              <q-icon name="campaign" size="xs" class="q-mr-xs" /> Announcement
            </div>
            <div class="text-caption text-grey-7">{{ formatDate(notice.created_at) }}</div>
          </q-card-section>
          <q-card-section class="col">
            <div class="text-h6 text-weight-bold q-mb-sm">{{ notice.title }}</div>
            <div class="text-body2 text-grey-8" style="white-space: pre-wrap">
              {{ notice.content }}
            </div>
          </q-card-section>
          <q-separator v-if="canManage" />
          <q-card-actions align="right" v-if="canManage">
            <q-btn
              flat
              round
              color="grey-7"
              icon="delete"
              size="sm"
              @click="deleteNotice(notice.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-xl" />

    <!-- Messages Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">Messages</div>
      <q-btn
        unelevated
        color="primary"
        label="New Message"
        icon="send"
        no-caps
        @click="openMsgDialog"
      />
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Inbox / Outbox Tabs -->
      <div class="col-12">
        <q-card class="no-shadow border-gray rounded-borders">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="inbox" label="Inbox" />
            <q-tab name="sent" label="Sent" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="inbox" class="q-pa-none">
              <q-list separator>
                <q-item v-if="inboxMessages.length === 0" class="q-pa-md text-center text-grey"
                  >No messages received.</q-item
                >
                <q-item
                  v-for="msg in inboxMessages"
                  :key="msg.id"
                  clickable
                  v-ripple
                  @click="viewMessage(msg)"
                >
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">{{
                      getInitials(msg.sender?.full_name)
                    }}</q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{
                      msg.sender?.full_name
                    }}</q-item-label>
                    <q-item-label caption lines="1">{{ msg.content }}</q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-item-label caption>{{ formatTime(msg.created_at) }}</q-item-label>
                    <q-icon name="circle" size="10px" color="blue" v-if="!msg.is_read" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="sent" class="q-pa-none">
              <q-list separator>
                <q-item v-if="sentMessages.length === 0" class="q-pa-md text-center text-grey"
                  >No messages sent.</q-item
                >
                <q-item v-for="msg in sentMessages" :key="msg.id">
                  <q-item-section avatar>
                    <q-avatar color="grey-4" text-color="black">{{
                      getInitials(msg.receiver?.full_name)
                    }}</q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>To: {{ msg.receiver?.full_name }}</q-item-label>
                    <q-item-label caption lines="1">{{ msg.content }}</q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-item-label caption>{{ formatTime(msg.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Dialogs -->

    <!-- Post Notice Dialog -->
    <q-dialog v-model="showNoticeDialog">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section><div class="text-h6">Post Notice</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input outlined dense v-model="noticeForm.title" label="Title" />
          <q-input outlined dense v-model="noticeForm.content" type="textarea" label="Content" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Post"
            color="black"
            no-caps
            @click="postNotice"
            :loading="sending"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Send Message Dialog -->
    <q-dialog v-model="showMsgDialog">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section><div class="text-h6">Send Message</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            outlined
            dense
            v-model="msgForm.receiver_id"
            :options="userOptions"
            label="To User"
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="filterUsers"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input outlined dense v-model="msgForm.content" type="textarea" label="Message" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Send"
            color="primary"
            no-caps
            @click="sendMessage"
            :loading="sending"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View Message Dialog -->
    <q-dialog v-model="viewMsgDialog">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section class="row items-center">
          <q-avatar color="primary" text-color="white" class="q-mr-md">{{
            getInitials(selectedMsg?.sender?.full_name)
          }}</q-avatar>
          <div>
            <div class="text-weight-bold">{{ selectedMsg?.sender?.full_name }}</div>
            <div class="text-caption text-grey">{{ formatTime(selectedMsg?.created_at) }}</div>
          </div>
        </q-card-section>
        <q-card-section class="text-body1">
          {{ selectedMsg?.content }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup no-caps />
          <q-btn flat label="Reply" color="primary" no-caps @click="replyToMsg(selectedMsg)" />
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
const notices = ref([])
const inboxMessages = ref([])
const sentMessages = ref([])
const tab = ref('inbox')

const showNoticeDialog = ref(false)
const showMsgDialog = ref(false)
const viewMsgDialog = ref(false)
const sending = ref(false)
const selectedMsg = ref(null)

// Forms
const noticeForm = ref({ title: '', content: '' })
const msgForm = ref({ receiver_id: null, content: '' })

// User Options for messaging
const userOptions = ref([])
const allUsers = ref([]) // Cache for search

// User State
const currentUser = ref(null)
const userRole = ref(null)

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  currentUser.value = user
  if (user) {
    // Get role
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    userRole.value = data?.role

    fetchNotices()
    fetchMessages()
    fetchAllUsers() // Pre-load or could load on demand
  }
})

const canManage = computed(() => ['admin', 'teacher'].includes(userRole.value))

// --- Notices Logic ---
const fetchNotices = async () => {
  const { data } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })
  if (data) notices.value = data
}

const openNoticeDialog = () => {
  noticeForm.value = { title: '', content: '' }
  showNoticeDialog.value = true
}

const postNotice = async () => {
  if (!noticeForm.value.title || !noticeForm.value.content) return
  sending.value = true
  const { error } = await supabase.from('notices').insert({
    title: noticeForm.value.title,
    content: noticeForm.value.content,
    created_by: currentUser.value.id,
  })

  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    showNoticeDialog.value = false
    $q.notify({ type: 'positive', message: 'Notice posted' })
    fetchNotices()
  }
  sending.value = false
}

const deleteNotice = async (id) => {
  if (!confirm('Delete this notice?')) return
  const { error } = await supabase.from('notices').delete().eq('id', id)
  if (!error) fetchNotices()
}

// --- Messages Logic ---
const fetchMessages = async () => {
  if (!currentUser.value) return

  // Inbox
  const { data: inbox } = await supabase
    .from('messages')
    .select('*, sender:sender_id(full_name)')
    .eq('receiver_id', currentUser.value.id)
    .order('created_at', { ascending: false })

  if (inbox) inboxMessages.value = inbox

  // Sent
  const { data: sent } = await supabase
    .from('messages')
    .select('*, receiver:receiver_id(full_name)')
    .eq('sender_id', currentUser.value.id)
    .order('created_at', { ascending: false })

  if (sent) sentMessages.value = sent
}

const fetchAllUsers = async () => {
  const { data } = await supabase.from('profiles').select('id, full_name, email')
  if (data) {
    allUsers.value = data.map((u) => ({ label: `${u.full_name} (${u.email})`, value: u.id }))
    userOptions.value = allUsers.value
  }
}

const filterUsers = (val, update) => {
  if (val === '') {
    update(() => {
      userOptions.value = allUsers.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    userOptions.value = allUsers.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}

const openMsgDialog = () => {
  msgForm.value = { receiver_id: null, content: '' }
  showMsgDialog.value = true
}

const sendMessage = async () => {
  if (!msgForm.value.receiver_id || !msgForm.value.content) return
  sending.value = true
  const { error } = await supabase.from('messages').insert({
    sender_id: currentUser.value.id,
    receiver_id: msgForm.value.receiver_id,
    content: msgForm.value.content,
  })

  if (error) $q.notify({ type: 'negative', message: error.message })
  else {
    showMsgDialog.value = false
    $q.notify({ type: 'positive', message: 'Message sent' })
    fetchMessages()
  }
  sending.value = false
}

const viewMessage = async (msg) => {
  selectedMsg.value = msg
  viewMsgDialog.value = true

  if (!msg.is_read) {
    // Mark as read
    await supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
    msg.is_read = true // local update
    // Check reading unread counts could be added here
  }
}

const replyToMsg = (msg) => {
  viewMsgDialog.value = false
  msgForm.value = { receiver_id: msg.sender_id, content: '' }
  showMsgDialog.value = true
}

// Helpers
const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

const formatDate = (date) => new Date(date).toLocaleDateString()
const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
.h-100 {
  height: 100%;
}
</style>
