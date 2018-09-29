<template>
    <div class="mark-info" v-if="showMarkInfo">
        <div class="info" v-if="mark" v-show="showMarkInfo">
            <span class="success-left left">
                <img src="./img/info.png" alt="">
            </span>
            <span class="success-right right" v-text="markText"></span>
        </div>
        <div class="info" v-if="!mark" v-show="showMarkInfo">
            <span class="fail-left left">
                <img src="./img/info.png" alt="">
            </span>
            <span class="fail-right right" v-text="markText"></span>
        </div>
    </div>
</template>

<script>
   export default {
       name: 'MarkInfo',
       data() {
           return {}
       },
        props: {
            showMarkInfo: Boolean,
            mark: Boolean,
            markText: String
        },
       methods: {
       }
   } 
</script>

<style lang="scss" scope>
.mark-info {
    position: fixed;
    top: 10%;
    margin: auto;
    left: 0px;
    width: 200px;
    height: 30px;
    right: 0px;
    color: white;
    z-index: 1000;
    .info {
        width: 100%;
        height: 100%;
        display: flex;
        .left {
            width: 30px;
            height: 100%;
            display: inline-block;
            text-align: center;
            line-height: 30px;
            img {
                width: 12px;
                margin-top: 6px;
            }
        }
        .right {
            display: inline-block;
            width: 170px;
            height: 100%;
            text-align: left;
            line-height: 30px;
            img {
                width: 12px;
                margin-top: 6px;
            }
        }
        .success-left {
            background: #757474;
        }
        .success-right {
            background: #757474;
        }
        .fail-left {
            background: #ba4545;
        }
        .fail-right {
            background: #ba4545;
        }
    }
}
</style>

