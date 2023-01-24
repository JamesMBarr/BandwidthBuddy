<script setup lang="ts">
import { signInWithEmailAndPassword } from "firebase/auth";
import { onMounted, ref } from "vue";
import { getCurrentUser } from "vuefire";
import router from "@/router";
import { useRoute } from "vue-router";
import { auth } from "@/firebase";

const route = useRoute();

const username = ref("");
const password = ref("");
const loading = ref(false);

/**
 * Get the redirectTo argument from the query string if it exists else returns
 * "/".
 * @returns redirectTo as a string
 */
const getRedirectTo = () =>
  route.query.redirectTo && typeof route.query.redirectTo === "string"
    ? route.query.redirectTo
    : "/";

async function login() {
  try {
    loading.value = true;
    await signInWithEmailAndPassword(auth, username.value, password.value);
    loading.value = false;
    router.push(getRedirectTo());
  } catch (error) {
    // TODO: display error to user
    console.error(error);
    loading.value = false;
  }
}

onMounted(async () => {
  // user can be signed in automatically then redirect user
  const currentUser = await getCurrentUser();
  if (currentUser) {
    router.push(getRedirectTo());
  }
});
</script>

<template>
  <div class="login-view">
    <form @submit.prevent="login">
      <label for="email"
        >Email
        <input v-model="username" type="email" />
      </label>
      <label for="password"
        >Password
        <input v-model="password" type="password" />
      </label>
      <button type="submit" :aria-busy="loading">
        {{ !loading ? "Login" : "Please wait..." }}
      </button>
    </form>
  </div>
</template>
