<script setup lang="ts">
import { signInWithEmailAndPassword } from "firebase/auth";
import { onMounted, ref } from "vue";
import { getCurrentUser } from "vuefire";
import router from "@/router";
import { useRoute } from "vue-router";
import { auth } from "@/firebase";
import type { FirebaseError } from "@firebase/util";

const route = useRoute();

const username = ref("");
const password = ref("");
const loading = ref(false);
const invalidFlag = ref(false);
const errorFlag = ref(false);

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
    invalidFlag.value = false;
    errorFlag.value = false;

    await signInWithEmailAndPassword(auth, username.value, password.value);
    loading.value = false;
    router.push(getRedirectTo());
  } catch (error) {
    if (
      ["auth/user-not-found", "auth/wrong-password"].includes(
        (error as FirebaseError).code
      )
    ) {
      invalidFlag.value = true;
    } else {
      errorFlag.value = true;
    }

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
  <article class="login-view grid">
    <div>
      <hgroup>
        <h1>Sign in</h1>
        <h2>Keeping your internet speeds in check.</h2>
      </hgroup>
      <form @submit.prevent="login">
        <label for="email"
          >Email
          <input v-model="username" type="email" />
        </label>
        <label for="password"
          >Password
          <input v-model="password" type="password" />
        </label>
        <div
          :class="{ invisible: !(invalidFlag || errorFlag) }"
          class="error-message"
        >
          <small>
            {{
              invalidFlag
                ? "Incorrect email and password."
                : "Unexpected error. Please try again."
            }}</small
          >
        </div>
        <button type="submit" :aria-busy="loading">
          {{ !loading ? "Login" : "Please wait..." }}
        </button>
      </form>
    </div>
    <!-- Splash image -->
    <div></div>
  </article>
</template>

<style lang="scss" scoped>
@use "../assets/variables";

article {
  padding: 0;
  overflow: hidden;

  > div {
    padding: calc(var(--spacing) * 2);
  }

  > div:nth-of-type(2) {
    display: none;

    @media (min-width: variables.$large-bp) {
      display: block;
      background-color: black;
      background-image: url("@/assets/imgs/nasa-Q1p7bh3SHj8-unsplash.jpg");
      background-position: center;
      background-size: cover;
    }
  }
}

.error-message {
  color: #e60000;
  background-color: #ffe6e6;
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) * 0.5);
  margin-bottom: calc(var(--spacing) * 0.25);

  &.invisible {
    visibility: hidden;
  }
}
</style>
