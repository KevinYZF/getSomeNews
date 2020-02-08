export interface IWeiboSource {
  id?: number,
  weiboID: string,
  name: string
}

export interface IResource {
  id?: number;
  uniKey: string,
  title?: string,
  profilePic?: string,
  description?: string,
  url: string,
  order: number,
  author: string,
  source: string,
  categories?: string[]
}

export interface IMiscKeyVal {
  key: string,
  val: string
}

export abstract class CustomSource {
  public abstract sourceName(): string;
  protected abstract sourcePath(): string;
  protected abstract sourceParse(rawData: string): IResource[];
  protected requestHeader(): {} {
    return {};
  }

  public async fetchData(reqFunc: Function) {
    const rst = await reqFunc(this.sourcePath(), this.requestHeader());
    return this.sourceParse(rst);
  }
}

export const ENDPOINT = process.env.NODE_ENV === 'development' ? "http://localhost:8080"  : "";