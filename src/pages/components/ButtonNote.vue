<template>
  <button
    style="position: relative; left: 20px; top: 100px"
    class="btn"
    data-bs-toggle="modal"
    data-bs-target="#notesModal"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="48"
      height="48"
      style="
        cursor: pointer;
        transition:
          transform 0.2s ease,
          fill 0.3s;
      "
      class="note-icon"
    >
      <path
        fill="currentColor"
        d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 1.99 2 1.99h14c1.1 0 1.99-.9 1.99-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5zm7-2h4v-2h-4v2zm-2-3h6v-2H10v2zm-2-3h8v-2H8v2z"
      />
    </svg>
  </button>
</template>

<script>
export default {}
</script>

<style></style>
