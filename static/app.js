import home from './components/home.js'
import register from './components/register.js'
import login from './components/login.js'
import board from './components/board.js'
import summary from './components/summary.js'
import export_dashboard from './components/export_dashboard.js'

const routes = [
    {path: '/', component: home},
    {path: '/register', component: register},
    {path: '/login', component: login},
    {path: '/board', component: board},
    {path: '/summary', component: summary},
    {path: '/export', component: export_dashboard}
]

const router = new VueRouter({
    routes,
    base: '/',
})

const app = new Vue({
    el: '#app',
    router,
})