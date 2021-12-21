import React from 'react'
import MyClock from '../MyClock/MyClock'
import "./styles.css";
import "./styles2.scss";

export const App = () => {
  return (
    <div className="container tw-bg-gray-700 tw-rounded-xl tw-py-4">
      <div className={'tw-py-4'}>
        <div className={'my_styles_3'}>Hello React!!! ^_^</div>
      </div>
      <MyClock />
      <div className={'tw-py-4'}>
        <div className={'my_styles_4'}>Styles SCSS</div>
      </div>
    </div>
  )
}

export default App
