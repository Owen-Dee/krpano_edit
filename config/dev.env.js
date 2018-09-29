'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const stagingEnv = require('./staging.env')

module.exports = merge(stagingEnv, prodEnv, {
    NODE_ENV: '"development"',
    KRPANOURL: '"https://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/panos"', // krpano全景图的url
    SERVERURL: '"https://dev-res.jtl3d.com"',
    DESIGNIMGURL: '"https://oss-cn-shanghai.aliyuncs.com/j3ddev/Data/Designs"', // 设计方案缩略图url
    RENDERURL: '"https://dev-render.jtl3d.com/api"', //渲染服务url
})