import {
  createRouter,
  createWebHistory,
  type NavigationGuardWithThis,
} from "vue-router";
import { getCurrentUser } from "vuefire";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
  ],
});

/**
 * Guards routes which require authN. If current user is not set then route user
 * to the login page with a redirect in query.
 * @param to route to navigate to
 * @returns either void or returns alternative route to navigate to.
 */
const routeGuide: NavigationGuardWithThis<undefined> = async (to) => {
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        name: "login",
        query: {
          redirectTo: to.fullPath,
        },
      };
    }
  }
};

router.beforeEach(routeGuide);

export default router;
