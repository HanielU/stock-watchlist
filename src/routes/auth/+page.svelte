<script lang="ts">
  import { enhance } from "$app/forms";
</script>

<div class="p-5 h-full grid place-items-center">
  <form
    class="max-w-500px w-90% mx-auto bg-white p-3 rounded-md shadow flex flex-col gap-2 text-neutral-900"
    action="/auth?/login"
    method="POST"
    use:enhance
  >
    <input class="p-2 rounded-md border-(1 neutral-200)" type="text" name="username" />
    <button class="p-2 rounded-md bg-primary-400">Submit</button>
  </form>
</div>
