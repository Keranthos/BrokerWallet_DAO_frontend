const MainRoutes = {
  path: '/',
  meta: {
    requiresAuth: true
  },
  redirect: '/admin',
  component: () => import('@/views/admin/AdminLayout.vue'),
  children: [
    {
      path: 'admin',
      redirect: '/admin/medal-distribution'
    },
    {
      path: 'admin/medal-distribution',
      component: () => import('@/views/admin/components/MedalDistribution.vue')
    },
    {
      path: 'admin/medal-ranking',
      component: () => import('@/views/admin/components/MedalRanking.vue')
    },
    {
      path: 'admin/user-lookup',
      component: () => import('@/views/admin/components/UserLookup.vue')
    },
    {
      path: 'admin/account-status',
      component: () => import('@/views/admin/components/AccountStatus.vue')
    },
    {
      path: 'admin/material-detail/:id',
      component: () => import('@/views/admin/components/MaterialDetail.vue')
    }
  ]
};

export default MainRoutes;