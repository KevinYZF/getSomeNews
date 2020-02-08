import React from 'react';
import { StoreProps } from '../store/store';
import { observer, inject } from "mobx-react";
import { IWeiboSource } from '../store/models';

interface State {
  init: boolean,
  wSourceList: string[],
  cSourceList: string[]
}

let forceUpdate = true;

@inject('appStorage')
@observer
class SelectSourcePage extends React.PureComponent<StoreProps, State> {
  private _weiboSource: IWeiboSource[] = [];

  constructor(props: StoreProps) {
    super(props);
    
    this.state = {
      init: false,
      wSourceList: [],
      cSourceList: []
    }
    this._init();
  }

  private async _init() {
    await this.props.appStorage!.resumeSourceList();
    await this.props.appStorage!.getSources(forceUpdate);
    forceUpdate = false;
    this._weiboSource = await this.props.appStorage!.getWeiboSourceList();
    const wSourceList = this._weiboSource.map(ele => ele.name);
    this.props.appStorage!.getCustomSourceList();
    const cSourceList = this.props.appStorage!.csInstList.map(ele => ele.sourceName());
    this.setState({
      wSourceList,
      cSourceList,
      init: true
    })
  }

  private selectSource(sourceName: string) {
    this.props.appStorage!.setActiveSource(sourceName);
    window.location.hash = "#/feed";
  }

  private renderCard(title: string, index: number) {
    return (
      <tr key={index}>
        <td onClick={() => this.selectSource(title)}>
          <div className="level is-mobile">
            <div className="level-left">
              <div className="level-item">
                <span className="has-text-info">{title}</span>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <span className="icon">
                  <i className="fas fa-angle-right"></i>
                </span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  public render() {
    return (
      <div className="container is-fluid app-page">
        {this.state.init && <React.Fragment>
          <h4 className="title is-4" style={{"marginTop": "1em"}}>微博新闻源</h4>
          <table className="table is-fullwidth">
            <tbody>
              {this.state.wSourceList.map((ele, index) => this.renderCard(ele, index))}
            </tbody>
          </table>

          <h4 className="title is-4" style={{"marginTop": "1em"}}>其他新闻源</h4>
          <table className="table is-fullwidth">
            <tbody>
              {this.state.cSourceList.map((ele, index) => this.renderCard(ele, index))}
            </tbody>
          </table>
        </React.Fragment>}
        {!this.state.init && <React.Fragment>
          <progress className="progress is-medium is-primary" max="100" style={{marginTop: '250px'}}></progress>
        </React.Fragment>}
      </div>
    );
  }
}

export default SelectSourcePage;