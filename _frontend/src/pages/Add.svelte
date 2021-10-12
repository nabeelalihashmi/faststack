<script>
    import { onMount } from "svelte";

    let formElement = null;

    let name = ""
    let cnic = ""

    onMount(function () {
        formElement.addEventListener("submit", function (e) {
            e.preventDefault();
          
            const formData = new FormData(formElement);
            console.log(formData);
            fetch (formElement.getAttribute("action"), {
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name, cnic}),
                method: "post",
            })
            .then((res) => {
                return res.json();
            }).then((json) => {
                console.log("json: ", json);
            })
        })
    });
</script>

<form method="POST" bind:this={formElement} action="/api/person/add">
    Name: <input type="text" name="name" bind:value={name} /> <br />
    CNIC: <input type="number" name="cnic" bind:value={cnic} />

    <input type="submit" />
</form>
