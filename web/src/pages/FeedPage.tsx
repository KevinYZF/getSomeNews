import React from 'react';
import { StoreProps } from '../store/store';
import { observer, inject } from "mobx-react";
import { IResource } from '../store/models';
import moment from 'moment';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache, ListRowProps } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

const cellHeightCache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true
});


interface State {
  init: boolean
}

@inject('appStorage')
@observer
class FeedPage extends React.PureComponent<StoreProps, State> {
  private mainListRef: React.RefObject<List>;
  private wrapperRef: React.RefObject<HTMLDivElement>;

  constructor(props: StoreProps) {
    super(props);
    this.state = {
      init: false
    }
    this.wrapperRef = React.createRef();
    this.mainListRef = React.createRef();
  }

  public componentDidMount() {
    this.wrapperRef.current!.style.height = `${window.innerHeight}px`;
    this.setState({
      init: true
    });
  }

  public componentWillUnmount() {
    cellHeightCache.clearAll();
  }

  private get resource() {
    const resource = this.props.appStorage!.resource.filter(ele => {
      if (this.props.appStorage!.activeSource === '')
        return true;
      return this.props.appStorage!.activeSource === ele.source;
    });
    return resource;
  }

  private renderItemHeader(ele: IResource) {
    if (!ele.author || ele.author === ele.source)
      return ele.source;
    return `${ele.author} - ${ele.source}`;
  }

  private dateFormat(d: number) {
    const m = moment(d);
    return m.format('YYYY-MM-DD HH:mm');
  }

  private goToDetailPage(item: IResource) {
    this.props.appStorage!.setDetailUrl(item.url);
    if (item.source === '知乎日报') {
      window.location.href = item.url;
    } else {
      window.location.hash = '#/detail';
    }
  }

  private renderItem(props: ListRowProps) {
    const ele = this.resource[props.index];
    props.style.padding = '.5rem';
    return (
      <CellMeasurer
        cache={cellHeightCache}
        columnIndex={props.columnIndex}
        key={ele.uniKey}
        parent={props.parent}
        rowIndex={props.index}
      >
        <div key={ele.uniKey} style={props.style}>
          <div className="card">
            <div className="card-content app-news-item">
              <div className="media">
                {ele.profilePic && <div className="media-left">
                  <figure className="image is-64x64">
                    <img src={ele.profilePic} alt={this.renderItemHeader(ele)}/>
                  </figure>
                </div>}
                <div className="media-content">
                  <div className="content">
                    {ele.title && <p><strong>{ele.title}</strong></p>}
                    <p>
                      {!ele.title && <strong>{this.renderItemHeader(ele)}</strong>}
                      {ele.title && <small>{this.renderItemHeader(ele)}</small>}
                    </p>
                    <p><small>{this.dateFormat(ele.order)}</small></p>
                  </div>
                </div>
              </div>
              {ele.description && <div className="content">
                <p dangerouslySetInnerHTML={{__html: ele.description}}></p>
              </div>}
              <div className="app-click-layer" onClick={() => this.goToDetailPage(ele)}></div>
            </div>
          </div>
        </div>
        {/* <div className="box" key={ele.uniKey} style={props.style}>
          <article className="media app-news-item">
            {ele.profilePic && <div className="media-left">
              <figure className="image is-64x64">
                <img src={ele.profilePic} />
              </figure>
            </div>}
            <div className="media-content">
              <div className="content">
                {ele.title && <p><strong>{ele.title}</strong></p>}
                <p>
                  {!ele.title && <strong>{this.renderItemHeader(ele)}</strong>}
                  {ele.title && <small>{this.renderItemHeader(ele)}</small>}
                </p>
                <p><small>{this.dateFormat(ele.order)}</small></p>
                {ele.description && <p dangerouslySetInnerHTML={{__html: ele.description}}></p>}
              </div>
            </div>
            <div className="app-click-layer" onClick={() => this.goToDetailPage(ele)}></div>
          </article>
        </div> */}
      </CellMeasurer>
    );
  }

  public render() {
    return (
      <div className="container is-fluid app-page" ref={this.wrapperRef}>
        {this.state.init && <AutoSizer>
          {({height, width}) => (
            <List 
              ref={this.mainListRef}
              width={width}
              height={height}
              rowCount={this.resource.length}
              rowHeight={cellHeightCache.rowHeight}
              rowRenderer={this.renderItem.bind(this)}
            />
          )}
        </AutoSizer>}
      </div>
    );
  }
}

export default FeedPage;