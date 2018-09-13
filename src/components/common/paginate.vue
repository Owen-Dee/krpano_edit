<template>
  <ul :class="containerClass" v-if="!noLiSurround">
    <li :class="[prevClass, { disabled: firstPageSelected() }]">
      <a @click="prevPage()" @keyup.enter="prevPage()" :class="prevLinkClass" tabindex="0"><slot name="prevContent">{{ prevText }}</slot></a>
    </li>
    <li v-for="page in pages" :class="[pageClass, page.selected ? activeClass : '', { disabled: page.disabled } ]">
      <a v-if="page.disabled" :class="pageLinkClass" tabindex="0">{{ page.content }}</a>
      <a v-else @click="handlePageSelected(page.index)" @keyup.enter="handlePageSelected(page.index)" :class="pageLinkClass" tabindex="0">{{ page.content }}</a>
    </li>
    <li :class="[nextClass, { disabled: lastPageSelected() }]">
      <a @click="nextPage()" @keyup.enter="nextPage()" :class="nextLinkClass" tabindex="0"><slot name="nextContent">{{ nextText }}</slot></a>
    </li>

    <!-- <li class="skip-btn" @mouseenter="mouseEnter()">
      <span>跳至</span>
    </li>

    <li class="skip-to-page-container" v-show="showSkipPage" 
        @mouseleave="mouseLeave()">
      <input type="text" v-model="inputPage" style="width: 45px; height: 24px; text-align: center;outline: none;" 
        @keyup.enter="skipToCurrentPage">
      <span>页</span>
      <span style="margin-left: 2px; cursor:pointer" v-on:click="skipToCurrentPage">跳转</span>
      <span class="triangle-down"></span>
    </li> -->

  </ul>

  <div :class="containerClass" v-else>
    <a @click="prevPage()" @keyup.enter="prevPage()" :class="[prevLinkClass, { disabled: firstPageSelected() }]" tabindex="0"><slot name="prevContent">{{ prevText }}</slot></a>
    <template v-for="page in pages">
      <a v-if="page.disabled" :class="[pageLinkClass, page.selected ? activeClass : '', { disabled: page.disabled }]" tabindex="0">{{ page.content }}</a>
      <a v-else @click="handlePageSelected(page.index)" @keyup.enter="handlePageSelected(page.index)" :class="[pageLinkClass, { active: page.selected, disabled: page.disabled }]" tabindex="0">
        {{ page.content }}
      </a>
    </template>
    <a @click="nextPage()" @keyup.enter="nextPage()" :class="[nextLinkClass, { disabled: lastPageSelected() }]" tabindex="0"><slot name="nextContent">{{ nextText }}</slot></a>
  </div>
</template>

<script>
export default {
  name: 'pagination',
  props: {
    pageCount: {
      type: Number,
      required: true
    },
    initialPage: {
      type: Number,
      default: 0
    },
    refreshPagination: {
      type: Boolean,
      default: false
    },
    forcePage: {
      type: Number
    },
    clickHandler: {
      type: Function,
      default: () => { }
    },
    pageRange: {
      type: Number,
      default: 3
    },
    marginPages: {
      type: Number,
      default: 1
    },
    prevText: {
      type: String,
      default: 'Prev'
    },
    nextText: {
      type: String,
      default: 'Next'
    },
    containerClass: {
      type: String
    },
    pageClass: {
      type: String
    },
    pageLinkClass: {
      type: String
    },
    prevClass: {
      type: String
    },
    prevLinkClass: {
      type: String
    },
    nextClass: {
      type: String
    },
    nextLinkClass: {
      type: String
    },
    activeClass: {
      type: String,
      default: 'active'
    },
    noLiSurround: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selected: this.initialPage,
      inputPage: 1,
      showSkipPage: false
    }
  },
  beforeUpdate() {
    if (this.forcePage === undefined) return
    if (this.forcePage !== this.selected) {
      this.selected = this.forcePage
    }
  },
  computed: {
    pages: function () {
      let items = {}
      if (this.pageCount <= this.pageRange) {
        for (let index = 0; index < this.pageCount; index++) {
          let page = {
            index: index,
            content: index + 1,
            selected: index === this.selected
          }
          items[index] = page
        }
      } else {
        let leftPart = this.pageRange / 2
        let rightPart = this.pageRange - leftPart

        if (this.selected < leftPart) {
          leftPart = this.selected
          rightPart = this.pageRange - leftPart
        } else if (this.selected > this.pageCount - this.pageRange / 2) {
          rightPart = this.pageCount - this.selected
          leftPart = this.pageRange - rightPart
        }

        let setPageItem = index => {
          let page = {
            index: index,
            content: index + 1,
            selected: index === this.selected
          }

          items[index] = page
        }

        let setBreakView = index => {
          let breakView = {
            content: '...',
            disabled: true
          }

          items[index] = breakView
        }

        // 1st - loop thru low end of margin pages
        for (let i = 0; i < this.marginPages; i++) {
          setPageItem(i);
        }

        // 2nd - loop thru high end of margin pages
        for (let i = this.pageCount - 1; i >= this.pageCount - this.marginPages; i--) {
          setPageItem(i);
        }

        // 3rd - loop thru selected range
        let selectedRangeLow = 0;
        if (this.selected - this.pageRange > 0) {
          selectedRangeLow = this.selected - this.pageRange;
        }

        let selectedRangeHigh = this.pageCount;
        if (this.selected + this.pageRange < this.pageCount) {
          selectedRangeHigh = this.selected + this.pageRange;
        }

        for (let i = selectedRangeLow; i <= selectedRangeHigh && i <= this.pageCount - 1; i++) {
          setPageItem(i);
        }

        // Check if there is breakView in the left of selected range
        if (selectedRangeLow > this.marginPages) {
          setBreakView(selectedRangeLow - 1)
        }

        // Check if there is breakView in the right of selected range
        if (selectedRangeHigh + 1 < this.pageCount - this.marginPages) {
          setBreakView(selectedRangeHigh + 1)
        }
      }
      return items
    }
  },
  watch: {
    refreshPagination: function() {
      this.selected = 0;
      this.inputPage = 1;
    }
  },
  methods: {
    handlePageSelected(selected) {
      if (this.selected === selected) {
        return
      }

      this.selected = selected;
      this.inputPage = selected + 1;
      this.clickHandler(this.selected + 1);
    },
    prevPage() {
      if (this.selected <= 0) {
        return
      }

      this.selected--;
      this.inputPage = this.selected + 1;
      this.clickHandler(this.selected + 1);
    },
    nextPage() {
      if (this.selected >= this.pageCount - 1) {
        return
      } 

      this.selected++;
      this.inputPage = this.selected + 1;
      this.clickHandler(this.selected + 1);
    },
    firstPageSelected() {
      return this.selected === 0
    },
    lastPageSelected() {
      return (this.selected === this.pageCount - 1) || (this.pageCount === 0)
    },
    skipToCurrentPage() {
      var reg = /^\+?[1-9][0-9]*$/;//正整数
      if (reg.test(this.inputPage) && parseInt(this.inputPage) <= this.pageCount) {
        this.selected = this.inputPage - 1;
        this.clickHandler(this.selected + 1);
        this.showSkipPage = false;
      }
    },
    mouseEnter() {
      this.showSkipPage = true;
    },
    mouseLeave() {
      this.showSkipPage = false;
    }
  }
}
</script>

<style lang="scss" scoped>
  a {
    cursor: pointer;
  }

  .skip-btn {
    position: absolute;
    right: 5px;
    cursor: pointer;
  }
  .skip-to-page-container {
    position: absolute;
    right: 0px;
    bottom: 50px;
    display: inline-block;
    height: 40px;
    width: 140px;
    background: #484848;
    text-align: center;
    z-index: 1000;
  }
  .triangle-down {
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #484848;
    position: absolute;
    bottom: -10px;
    right: 0px;
  }
</style>