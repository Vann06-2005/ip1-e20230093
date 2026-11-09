<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="page">
    <AppHeader />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f4f6f5;
  color: #1f2937;
}
.page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px 40px;
}
</style>
