import DefaultTheme from 'vitepress/theme-without-fonts'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import { tokenizeSearch } from '../search'
import SearchFocusGuard from './SearchFocusGuard'
import NightlabModel from './NightlabModel.vue'
import ModelAttribution from './ModelAttribution.vue'
import HomeStatus from './HomeStatus.vue'
import './custom.css'
import './model.css'

// Keep VitePress navigation, language switching and local search behavior.
export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'home-hero-info-before': () => h(HomeStatus), 'home-hero-image': () => h(NightlabModel), 'doc-after': () => h(ModelAttribution), 'layout-bottom': () => h(SearchFocusGuard) }),
  enhanceApp({ siteData }) {
    const data = siteData.value
    const search = data.themeConfig.search
    if (search?.provider !== 'local') return
    // Replace the root value so this also works with VitePress's readonly dev
    // data. Locale theme overrides inherit these local-search options.
    siteData.value = {
      ...data,
      themeConfig: {
        ...data.themeConfig,
        search: {
          ...search,
          options: {
            ...search.options,
            miniSearch: {
              ...search.options?.miniSearch,
              options: { ...search.options?.miniSearch?.options, tokenize: tokenizeSearch },
            },
          },
        },
      },
    }
  },
} satisfies Theme
