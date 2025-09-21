const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  
  children: [
    {
      name: 'Login',
      path: '/login',
      component: () => import('@/views/authentication/auth/LoginPage.vue')
    },
    {
      name: 'Register',
      path: '/register',
      component: () => import('@/views/authentication/auth/RegisterPage.vue')
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      redirect: '/admin/medal-distribution',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'medal-distribution',
          name: 'MedalDistribution',
          component: () => import('@/views/admin/components/MedalDistribution.vue')
        },
        {
          path: 'medal-ranking',
          name: 'MedalRanking',
          component: () => import('@/views/admin/components/MedalRanking.vue')
        },
        {
          path: 'material-detail/:id',
          name: 'MaterialDetail',
          component: () => import('@/views/admin/components/MaterialDetail.vue')
        }
      ]
    }
  ]
};

export default PublicRoutes;