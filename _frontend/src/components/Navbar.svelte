<script>
    import {RouterLink } from '@easyroute/svelte'
</script>

<div>
    <RouterLink to={"/"}> Home </RouterLink> |
    <RouterLink to={"/add_person"}> Add </RouterLink> |
    <RouterLink to={"/person"}> All </RouterLink> 
</div>