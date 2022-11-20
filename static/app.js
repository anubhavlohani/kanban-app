import home from './components/home.js'
import register from './components/register.js'
import login from './components/login.js'

const routes = [
    {path: '/', component: home},
    {path: '/register', component: register},
    {path: '/login', component: login}
]

const router = new VueRouter({
    routes,
    base: '/',
})

const app = new Vue({
    el: '#app',
    router,
})