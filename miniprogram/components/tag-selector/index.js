// components/tag-selector/index.js
const { CREATIVITY_TAGS } = require('../../utils/constants.js')

Component({
  properties: {
    selectedTags: {
      type: Array,
      value: []
    }
  },

  data: {
    tags: CREATIVITY_TAGS
  },

  methods: {
    onToggle(e) {
      const tag = e.currentTarget.dataset.tag
      const selected = [...this.data.selectedTags]
      const idx = selected.indexOf(tag)
      if (idx > -1) {
        selected.splice(idx, 1)
      } else {
        selected.push(tag)
      }
      this.triggerEvent('change', { tags: selected })
    }
  }
})
