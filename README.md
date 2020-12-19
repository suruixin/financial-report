## 说明

本项目是基于[网易财经](http://quotes.money.163.com/)做的一款沪深财报数据爬取,使用的语言为`node`

> 爬取内容如下

- 资产负债表
- 利润表
- 现金流量表
- 主要财务指标表

## 启动

> 安装依赖

```
npm install
// or
yarn
```

> 运行

```
npm run watch // 编译文件
npm start // 运行爬取
```

## 使用指南

> 配置打包地址

修改`index.ts`中`outDir`字段

> 配置要爬取的公司

修改`config/stock_code.txt`

通过换行来爬取多公司数据 通过` `来区分公司股票代码和公司名称

支持以下格式

```
000001 平安银行
000002.SZ 万科A
```

- ps: 因`*"\`等格式创建文件会报错,所以默认是会将这些符号删除的,这样会导致爬取到的文件名会和输入的文件名不一致,请注意!

## License

financial-report is [MIT licensed](./LICENSE).
