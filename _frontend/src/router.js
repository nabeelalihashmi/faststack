import Router from '@easyroute/core';
import historyMode from '@easyroute/core/history-mode';

import Home from './pages/Home.svelte';
import Display from './pages/Display.svelte';
import List from './pages/List.svelte';
import Add from './pages/Add.svelte';
import NotFound from './pages/NotFound.svelte';

export const router = new Router({
    mode: historyMode,
    omitTrailingSlash: true,

    routes: [
        {
            path: '/',
            component: Home,
            name: 'Home'
        },
        {
            path: '/person',
            component: List,
            name: 'List'
        },
        {
            path: '/person/:id',
            component: Display,
            name: 'Display'
        },
        {
            path: '/add_person',
            component: Add,
            name: 'Add'
        },

        {
            path: '*',
            component: NotFound,
            name: 'Not Found'
        }
    ]
});