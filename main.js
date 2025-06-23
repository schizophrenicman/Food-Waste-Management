import './style.css'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Welcome to the App</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
