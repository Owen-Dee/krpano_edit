'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    KRPANOURL: '"http://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/panos"',
    SERVERURL: '"http://dev-res.jtl3d.com"'
})