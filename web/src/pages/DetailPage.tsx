import React from 'react';
import { StoreProps } from '../store/store';
import { observer, inject } from "mobx-react";

@inject('appStorage')
@observer
class DetailPage extends React.PureComponent<StoreProps> {
  private ifRef = React.createRef<HTMLIFrameElement>();

  public componentDidMount() {
    this.ifRef.current!.style.height = `${window.innerHeight}px`;
  }

  public render() {
    return (
      <div className="container is-fluid app-page">
        <iframe title="detail page" ref={this.ifRef} className="is-overlay app-web-view" src={this.props.appStorage!.detailUrl} />
      </div>
    );
  }
}

export default DetailPage;