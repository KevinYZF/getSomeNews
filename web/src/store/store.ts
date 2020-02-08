import { observable, action } from "mobx";
import { IResource, CustomSource, ENDPOINT } from './models';
import AppStorageLocal from './localDB';
import moment from 'moment';
import customSource from './customSource';


const localDB = new AppStorageLocal();

export default class AppStorage {
  /** --------------------------weibo-------------------------------- **/

  public async getWeiboResource() {
    const weiboList = await localDB.getAllWeiboSourceID();
    if (!weiboList || weiboList.length === 0) {
      return;
    }
    await Promise.all(weiboList.map(async ele => {
      const reqUrl = `https://m.weibo.cn/api/container/getIndex?page=1&count=25&containerid=107603${ele}`;
      const rst = await this.reqUrl(reqUrl);
      await this.getWeiboSourceCallback(rst);
    }));
  }

  private parseWeiboCreatedAtField(field: string) {
    const m = moment();
    if (field.includes('-')) {
      const dtArr = field.split('-');
      if (dtArr.length === 2) {
        const year = moment().year().toString();
        dtArr.unshift(year);
      }
      m.year(parseInt(dtArr[0]));
      m.month(parseInt(dtArr[1]) - 1);
      m.date(parseInt(dtArr[2]));
    } else {
      field = field.replace('前', '');
      let sep: string;
      if (field.includes('小时')) {
        sep = '小时';
        const val = parseInt(field.replace(sep, ''));
        m.subtract(val, 'hours');
      }
      if (field.includes('分钟')) {
        sep = '分钟';
        const val = parseInt(field.replace(sep, ''));
        m.subtract(val, 'minutes');
      }
    }
    return new Date(m as any).getTime();
  }

  @action
  private async getWeiboSourceCallback(data: string) {
    const args = JSON.parse(data);
    if (args.ok !== 1) return;
    args.data.cards.forEach((item: any) => {
      const info = item.mblog;
      if (!info) return;
      if (this.resourceIndex.includes(info.idstr)) return;
      this.resourceIndex.push(info.idstr);
      this.resource.push(this.checkSource({
        order: this.parseWeiboCreatedAtField(info.created_at),
        description: info.text,
        profilePic: info.bmiddle_pic ? this.convertToProxyUrl(info.bmiddle_pic) : info.user.profile_image_url,
        author: info.user.screen_name,
        url: item.scheme,
        source: info.user.screen_name,
        uniKey: info.idstr
      }, true));
    });
    this.resourceSorting();
    await localDB.setValue('lastUpdateDate', new Date().getTime());
  }

  public getWeiboSourceList() {
    return localDB.getAllWeiboSource();
  }

  /** ----------------------custom source----------------------------- **/

  @observable csInstList: CustomSource[] = [];
  
  @action
  public getCustomSourceList() {
    if (this.csInstList.length > 0) return;
    this.csInstList = [];
    this.csInstList.push(new customSource.zhihuDaily());
    this.csInstList.push(new customSource.fengHuang());
  }

  private async getCustomSource() {
    if (this.csInstList.length === 0)
      this.getCustomSourceList();
    
    await Promise.all(this.csInstList.map(async csObj => {
      const items = await csObj.fetchData(this.reqUrl.bind(this));
      items.forEach(element => {
        if (this.resourceIndex.includes(element.title!)) return;
        this.resourceIndex.push(element.title!);
        this.resource.push(this.checkSource(element, true));
      })
    }));
    this.resourceSorting();
    await localDB.setValue('lastUpdateDate', new Date().getTime());
  }

  /** --------------------------global-------------------------------- **/
  @observable resource: IResource[] = [];
  @observable resourceIndex: string[] = [];
  @observable sourceList: string[] = [];
  @observable activeSource: string = "";
  @observable detailUrl: string = "";

  @action
  private async getSourceFromCache() {
    this.resource = await localDB.getResource();
    this.resourceIndex = localDB.getResourceIndex(this.resource);
    this.resource.forEach(ele => this.checkSource(ele));
    this.resourceSorting();
  }

  public async getSources(forceUpdate:boolean = false) {
    const lastUpdateDate = await localDB.getValue('lastUpdateDate');
    if (!forceUpdate) {
      if (lastUpdateDate) {
        const now = new Date().getTime();
        const lud = parseInt(lastUpdateDate.val);
        if (now - lud < 1000 * 60 * 60) {
          return this.getSourceFromCache();
        }
      }
    }
    await this.getSourceFromCache();
    await Promise.all([
      this.getWeiboResource(),
      this.getCustomSource()
    ]);
    this.resourceSorting();
  }

  @action 
  public setActiveSource(target: string) {
    this.activeSource = target;
  }

  @action setDetailUrl(url: string) {
    this.detailUrl = url;
  }

  @action
  private checkSource(ele: IResource, save: boolean = false): IResource {
    if (save) {
      localDB.saveResource(ele).catch(err => {
        console.log(ele);
      });
    }
    if (!this.sourceList.includes(ele.source)) {
      this.sourceList.push(ele.source);
    }
    return ele;
  }

  @action
  private resourceSorting() {
    this.resource = this.resource.slice().sort((eleA, eleB) => {
      if (eleA.order > eleB.order) 
        return -1;
      else return 1;
    });
  }

  public resumeSourceList() {
    return localDB.loadSourceListFromFile();
  }
  
  /** --------------------------normal request-------------------------------- **/

  private convertToProxyUrl(url: string) {
    const encodedUrl = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '!');
    return `${ENDPOINT}/pnc?&u=${encodedUrl}`;
  }

  public async reqUrl(url: string) {
    const encodedUrl = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '!');
    const res = await fetch(`${ENDPOINT}/p?fakeUA=1&u=${encodedUrl}`);
    const response: { ok: number, payload: string } = await res.json();
    if (response.ok) {
      return response.payload;
    }
    return '';
  }
}

export interface StoreProps {
  appStorage?: AppStorage
}