import { CustomSource, IResource } from '../models';
var htmlparser = require("htmlparser");

export default class zhihuDaily extends CustomSource {
  public sourceName() {
    return '知乎日报';
  }

  protected sourcePath() {
    return 'https://daily.zhihu.com/';
  }

  protected sourceParse(rawData: string) {
    const rst:IResource[] = [];
    const handler = new htmlparser.DefaultHandler((error: any, dom: any) => {
      if (error) {
        console.log(error);
        return;
      }
      dom[1].children[1].children[3].children[0].children[1].children[0].children.forEach((ele: any) => {
        ele.children.forEach((ele2: any) => {
          const childNode = ele2.children[0].children[0];
          const url = 'https://daily.zhihu.com' + childNode.attribs.href;
          const profilePic = childNode.children[0].attribs.src;
          const title = childNode.children[1].children[0].data;
          const order = new Date().getTime();
          const item: IResource = {
            url, profilePic, title, order, author: '',
            uniKey: title,
            source: this.sourceName()
          };
          rst.push(item);
        });
      });
    });
    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawData);
    return rst;
  }
}