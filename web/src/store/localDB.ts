import Dexie from 'dexie';
import { IWeiboSource, IResource, IMiscKeyVal } from './models';
const Source_List_File_Path = './source.list';


export default class AppStorageLocal extends Dexie {
  private weiboSource: Dexie.Table<IWeiboSource, number>;
  private resource: Dexie.Table<IResource, number>;
  private miscKeyVal: Dexie.Table<IMiscKeyVal, string>;
  public needForceUpdate: boolean = false;

  constructor() {
    super('AppStorageLocal');
    this.version(1).stores({
      weiboSource: 'id++, &weiboID, name',
      resource: 'id++, title, profilePic, description, &url, order, author, source, categories',
      miscKeyVal: '&key, val'
    });
    this.version(2).stores({
      resource: 'id++, title, profilePic, description, &url, order, author, source, categories, &uniKey'
    })
    this.weiboSource = this.table('weiboSource');
    this.resource = this.table('resource');
    this.miscKeyVal = this.table('miscKeyVal');
  }

  public async addWeiboSource(weiboID: string, name: string) {
    const countdown = await this.weiboSource.where({ weiboID }).count();
    if (countdown) 
      return;
    await this.weiboSource.add({
      weiboID, name
    });
  }

  public async getAllWeiboSourceID() {
    const data = await this.weiboSource.toArray();
    return data.map(item => item.weiboID);
  }

  public async getAllWeiboSource() {
    const data = await this.weiboSource.toArray();
    return data;
  }

  public async saveResource(data: IResource) {
    const searchCollection = this.resource.where({
      url: data.url
    });
    const count = await searchCollection.count();
    if (count === 0)
      return await this.resource.add(data);
    const oldRecord = await searchCollection.first() as IResource;
    const oldId = oldRecord.id!;
    await this.resource.delete(oldId);
    return await this.resource.add(data);
  }

  public async getResource() {
    return await this.resource.toArray();
  }

  public getResourceIndex(res: IResource[]): string[] {
    return res.map(res => res.uniKey);
  }

  public async setValue(key: string, value: any) {
    await this.miscKeyVal.put({ key, val: value.toString() });
  }

  public async getValue(key: string) {
    return await this.miscKeyVal.get(key);
  }

  public async loadSourceListFromFile() {
    const res = await fetch(Source_List_File_Path);
    const data: any = await res.json();
    const currentSourceCount = await this.weiboSource.count();
    //New source added
    if (data.weiboSources.length !== currentSourceCount) 
      this.needForceUpdate = true;
    await this.weiboSource.clear();
    await this.weiboSource.bulkAdd(data.weiboSources);
  }
}