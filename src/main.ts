import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <div class="boot">
      <h1>Light Duel</h1>
      <p>Bootstrapping Vite + Three.js...</p>
    </div>
  `;
}
