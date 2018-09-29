# krpano-edit

## 安装软件
安装Git, Node

## 环境搭建
* 1.从 jtl3d/krpano-edit fork一份到自己的空间中
* 2.将fork后的repo克隆到本地工作目录
  - git clone git@116.62.100.239:yourname/krpano-edit.git
  - 进入krpano-edit文件夹: cd krpano-edit
* 3.将原始的jtl3d/krpano-edit加到本地的remote中方便同步代码  
  - add remote：git remote add jtl3d git@116.62.100.239:jtl3d/krpano-edit.git  
  - 查看remote： git remote -v
* 4.进入本地krpano-edit目录，运行 npm install,安装依赖的node包

## 运行
* 1.开发环境: npm run dev
* 2.dev打包: npm run staging
* 6.product打包: npm run build
