<script>
    import { EasyrouteProvider } from '@easyroute/svelte';
    import { router } from './router.js'
    import { RouterOutlet, RouterLink } from '@easyroute/svelte'

    import Navbar from "./components/Navbar.svelte";


</script>

<EasyrouteProvider {router}>
    <Navbar />
    <RouterOutlet></RouterOutlet>

</EasyrouteProvider>