<template>
  <div></div>
</template>

<script setup>
// 邏輯抽離至 LogoutView.js，此處僅保留模板繫結
import { useLogoutView } from './LogoutView.js'

useLogoutView()
</script>
