'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    KRPANOURL: '"https://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/panos"',
    SERVERURL: '"https://dev-res.jtl3d.com"',
    DESIGNIMGURL: '"https://oss-cn-shanghai.aliyuncs.com/j3ddev/Data/Designs"',
})