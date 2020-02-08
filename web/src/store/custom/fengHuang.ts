import { CustomSource, IResource } from '../models';
import moment from 'moment';
var htmlparser = require("htmlparser");

export default class fengHuang extends CustomSource {
  private defaultImg = 'http://p0.ifengimg.com/37780e23b9ea2d8b/2017/38/logoNews.png';

  public sourceName() {
    return '凤凰网';
  }

  protected sourcePath() {
    return 'http://news.ifeng.com/';
  }

  protected sourceParse(rawData: string): IResource[] {
    let rst:IResource[] = [];
    const handler = new htmlparser.DefaultHandler((error: any, dom: any) => {
      if (error) {
        console.log(error);
        return;
      }
      const rootNode = dom[2].children[3].children[1].children[5].children[0];
      const type1Rst = this.type1(rootNode.children[2]);
      rst = rst.concat(type1Rst);
      const type2Rst = this.type2(rootNode.children[3]);
      rst = rst.concat(type2Rst);
      const type3Rst = this.type2(rootNode.children[4]);
      rst = rst.concat(type3Rst);
    });
    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawData);
    return rst; 
  }

  private parseTime(timeStr: string) {
    const timeArr = timeStr.split(' ');
    let m: any = moment();
    if (timeArr[0] !== '今天') {
      if (timeArr[0].split('-').length === 2) {
        m = moment(`${moment().year()}-${timeArr[0]}`);
      } else {
        m = moment(timeArr[0]);
      }
    }
    const [hour, minute] = timeArr[1].split(':');
    m.add(hour, 'hours').add(minute, 'minutes');
    return new Date(m).getTime();
  }

  private type1(dom: any): IResource[] {
    return dom.children[0].children.map((ele: any) => {
      const title = ele.children[0].attribs.title;
      const url = ele.children[0].attribs.href;
      const item: IResource = {
        title, url, 
        profilePic : this.defaultImg,
        order : new Date().getTime(),
        author : '',
        source : this.sourceName(),
        uniKey : title
      };
      return item;
    });
  }
  private type2(dom: any): IResource[] {
    return dom.children[0].children.map((ele: any) => {
      const noPic = ele.children.length === 1;
      const title = ele.children[0].attribs.title;
      const url = 'http:'+ele.children[0].attribs.href;
      // const profilePic = noPic ? this.defaultImg : 'http:'+ele.children[0].children[0].attribs.src;
      let profilePic = this.defaultImg;
      if (!noPic && ele.children[0].children[0].attribs.src) {
        profilePic = 'http:'+ele.children[0].children[0].attribs.src;
      }
      const author = noPic ? ele.children[0].children[1].children[0].children[0].data : ele.children[1].children[1].children[0].children[0].data;
      const order = noPic ? ele.children[0].children[1].children[1].children[0].data : this.parseTime(ele.children[1].children[1].children[1].children[0].data);
      const item: IResource = {
        title, url, profilePic,
        author, order, uniKey: title,
        source : this.sourceName()
      }
      return item;
    });
  }
}