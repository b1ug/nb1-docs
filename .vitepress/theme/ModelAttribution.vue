<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
const { lang, page } = useData()
const zh = computed(() => lang.value === 'zh-CN')
const visible = computed(() => page.value.relativePath === 'architecture.md' || page.value.relativePath === 'zh/architecture.md')
</script>
<template><aside v-if="visible" id="model-attribution" class="nightlab-model-attribution" :aria-label="zh ? '模型来源' : 'Model attribution'">
<strong>{{ zh ? '模型与灯号' : 'Model & LED notes' }}</strong>
<p>{{ zh ? '此交互模型用于屏幕示意，不代表设备状态、工程装配或光学测量。LED 1 为 blink(1) 字标面，LED 2 为 ThingM 面；旋转视角不会交换灯号。' : 'The interactive model is a screen illustration, not a device report, engineering assembly or optical measurement. LED 1 is the blink(1) wordmark face; LED 2 is the ThingM face. Turning the model never swaps them.' }}</p>
<p>ThingM / todbot · <a href="https://github.com/todbot/blink1/tree/101abe3599c661c4dd4d1204b4d50fb592293143/hardware/enclosure">blink(1) mk2 CAD</a> · <a :href="withBase('/nightlab/model-assets/LICENSE.txt')">CC BY-SA 4.0</a>. {{ zh ? '原 STL 保持不变；展示模型包含接缝拟合、材质与 USB 示意几何。' : 'Original STL files are unchanged; the display model adds seating fit, materials and illustrative USB geometry.' }}</p>
<p><a :href="withBase('/nightlab/source-receipt.json')">{{ zh ? '模型来源与变更记录' : 'Model sources & changes' }}</a> · <a :href="withBase('/nightlab/model-assets/source.json')">{{ zh ? 'CAD 资源记录' : 'CAD asset record' }}</a> · <a :href="withBase('/nightlab/vendor/three/LICENSE.txt')">Three.js MIT</a></p>
</aside></template>
