<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption">
        <h1>{{ t('home.title') }}</h1>
      </div>
      <!-- 首頁內容 -->
      <div>
        <table class="frame-table">
          <tbody>
            <tr>
              <td colspan="12">-</td>
            </tr>
            <tr>
              <td colspan="12">
                <h1>歡迎使用後台管理系統</h1>
                <p>這裡顯示主要的頁面內容。</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 邏輯抽離至 HomeView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import { useHomeView } from './HomeView.js'

const {
  t,
} = useHomeView()
</script>
