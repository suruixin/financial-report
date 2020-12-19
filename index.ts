import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { get } from "request";

interface CompanyInfo {
  name: string | undefined;
  id: string;
}
type Loop = "BalanceSheet" | "ProfitStatement" | "CashFlow" | "FinancialTable";

class GetData {
  private urls: { [p in Loop]: string } = {
    BalanceSheet: "http://quotes.money.163.com/service/zcfzb_", // 资产负债表
    ProfitStatement: "http://quotes.money.163.com/service/lrb_", // 利润表
    CashFlow: "http://quotes.money.163.com/service/xjllb_", // 现金流量表
    FinancialTable: "http://quotes.money.163.com/service/zycwzb_" // 主要财务指标表
  };
  private outDir: string = "./outDir";
  constructor(fileName: string) {
    const CompanyList: CompanyInfo[] = this.getConfig(fileName);
    this.loop(CompanyList);
  }
  /**
   * 下载资产负债表
   * @param companyInfo 公司信息 {id: 股票代码, name: 公司名称}
   * @param url
   * @param outDir
   */
  getBalanceSheet(companyInfo: CompanyInfo) {
    const fileName = `${companyInfo.name}_资产负债表`;
    return this.requsetCallBack(
      this.urls.BalanceSheet + companyInfo.id + ".html",
      this.outDir + "/" + companyInfo.name,
      fileName
    );
  }
  /**
   * 下载利润表
   * @param companyInfo 公司信息 {id: 股票代码, name: 公司名称}
   * @param url
   * @param outDir
   */
  getProfitStatement(companyInfo: CompanyInfo) {
    const fileName = `${companyInfo.name}_利润表`;
    return this.requsetCallBack(
      this.urls.ProfitStatement + companyInfo.id + ".html",
      this.outDir + "/" + companyInfo.name,
      fileName
    );
  }
  /**
   * 下载现金流量表
   * @param companyInfo 公司信息 {id: 股票代码, name: 公司名称}
   * @param url
   * @param outDir
   */
  getCashFlow(companyInfo: CompanyInfo) {
    const fileName = `${companyInfo.name}_现金流量表`;
    return this.requsetCallBack(
      this.urls.CashFlow + companyInfo.id + ".html",
      this.outDir + "/" + companyInfo.name,
      fileName
    );
  }
  /**
   * 下载主要财务指标表
   * @param companyInfo 公司信息 {id: 股票代码, name: 公司名称}
   * @param url
   * @param outDir
   */
  getFinancialTable(companyInfo: CompanyInfo) {
    const fileName = `${companyInfo.name}_主要财务指标表`;
    return this.requsetCallBack(
      this.urls.FinancialTable + companyInfo.id + ".html",
      this.outDir + "/" + companyInfo.name,
      fileName
    );
  }
  requsetCallBack(url: string, outDir: string, name: string | undefined) {
    return this.requset(url, outDir, name)
      .then((res) => {
        console.log(`${name}下载成功! 路径: ${outDir}/${name}`);
        return Promise.resolve(res);
      })
      .catch((err) => {
        console.error(`${name}下载失败! 失败原因: ${JSON.stringify(err)}`);
        return Promise.reject(err);
      });
  }
  private getConfig(fileName: string): CompanyInfo[] {
    try {
      const fileList: Buffer = readFileSync(
        join(__dirname, "../config", fileName)
      );
      const arr: string[] = fileList.toString().split("\n");
      return arr.map((it) => {
        const id: string = it.split(" ")[0]?.replace(/\..*?$/, "");
        const name: string | undefined = it
          .split(" ")[1]
          ?.replace(/[\<,\>,\/,\\,\|,\:,\",\*,\?,\s]/g, "");
        return {
          id,
          name
        };
      });
    } catch (e) {
      throw "读取配置文件失败";
    }
  }
  private requset(
    url: string,
    filePath: string = this.outDir,
    fileName?: string
  ) {
    if (!fileName) fileName = url.replace(/^.*\/(.*?).html/, "$1");
    fileName = fileName.replace(/[\<,\>,\/,\\,\|,\:,\",\*,\?]/g, "");
    this.mkdir(filePath);
    return new Promise((resolve, reject) => {
      get(url)
        .on("error", (error) => {
          reject(error);
        })
        .on("complete", () => {
          resolve(join(filePath, fileName!));
        })
        .pipe(createWriteStream(join(filePath, fileName! + ".csv")));
    });
  }
  private async loop(CompanyList: CompanyInfo[], count = 0) {
    if (!CompanyList[count]) {
      console.log("下载完成");
      return;
    }
    console.log(`${CompanyList[count].name} 准备完毕,即将开始下载! `);
    await this.getBalanceSheet(CompanyList[count]);
    await this.getProfitStatement(CompanyList[count]);
    await this.getCashFlow(CompanyList[count]);
    await this.getFinancialTable(CompanyList[count]);
    setTimeout(() => {
      this.loop(CompanyList, ++count);
    }, 5000);
  }
  private mkdir(filePath: string) {
    if (!existsSync(filePath)) mkdirSync(filePath);
  }
}

new GetData("stock_code.txt");
