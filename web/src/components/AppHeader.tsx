import React from 'react';

interface props {
  title: string,
  back: boolean,
  onBack (): void
}

const AppHeader:React.FC<props> = (prop: props) => {
  return (
    <nav className="navbar is-primary is-fixed-top">
      <div className="navbar-brand">
        {prop.back && <div className="app-back-btn" onClick={() => prop.onBack && prop.onBack()}>
          <span className="icon is-large">
            <i className="fas fa-angle-left" style={{fontSize: '1.5rem'}}></i>
          </span>
        </div>}
        <h4 className="app-title">{prop.title}</h4>
      </div>
    </nav>
  );
}

export default AppHeader;