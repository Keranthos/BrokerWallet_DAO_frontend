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
    }
  ]
};

export default MainRoutes;