import React from 'react';
import './styles/Topbar.css';

function Topbar(){
  return (
    <header className='topbar'>
        <span role="img" aria-label="Book Icon">&#128212;</span>
        <div>
            <h1>Online Learning Platform</h1>
            <h3>Small-scale online platform for teaching and assistance.</h3>
        </div>
    </header>
  );
}

export default React.memo(Topbar);
