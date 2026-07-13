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
import AppLayout from '@/layouts/AppLayout.vue'
import { t } from '@/locales'
</script>
