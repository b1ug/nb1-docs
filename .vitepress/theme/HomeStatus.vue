<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
const { lang } = useData()
const zh = computed(() => lang.value === 'zh-CN')
</script>
<template>
<a class="home-preview-status" :href="withBase(zh ? '/zh/support' : '/support')">
<span>v0.1.0</span><span aria-hidden="true">·</span><span>{{ zh ? '支持范围' : 'Support' }}</span>
</a>
</template>
