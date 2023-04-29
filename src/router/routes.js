const routes = [{
    name: 'homePage',
    path: '/',
    component: () =>
        import ('@/pages/homePage/index.vue')
}];

export default routes