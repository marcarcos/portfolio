console.log("IT’S ALIVE!");

// Navigation + Theme
const BASE_PATH = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? '/' : '/portfolio/';

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/marcarcos', title: 'GitHub' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`
);

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);
  a.toggleAttribute('target', a.host !== location.host);

  nav.append(a);
}

const select = document.querySelector('select');
function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  select.value = scheme;
}
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}
select.addEventListener("input", (event) => {
  const scheme = event.target.value;
  setColorScheme(scheme);
  localStorage.colorScheme = scheme;
});

// ========== FORM HANDLING (if using on contact page) ==========
const form = document.querySelector("form");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const params = [];
  for (let [key, value] of data) {
    const encoded = encodeURIComponent(value);
    params.push(`${key}=${encoded}`);
  }
  const url = `${form.action}?${params.join("&")}`;
  location.href = url;
});

// ========== FETCH PROJECTS JSON ==========
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

export async function fetchGitHubData(username) {
  return await fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(projects, containerElement, headingLevel = 'h3') {
  if (!containerElement) {
    console.error('renderProjects: container element not found.');
    return;
  }

  containerElement.innerHTML = '';

  if (!projects || projects.length === 0) {
    containerElement.innerHTML = `<p class="no-projects">No projects to display at this time.</p>`;
    return;
  }

  const safeHeading = /^h[1-6]$/.test(headingLevel) ? headingLevel : 'h3';

  for (const project of projects) {
    const article = document.createElement('article');
    article.innerHTML = `
      <${safeHeading}>${project.title}</${safeHeading}>
      <img src="${project.image || 'images/fallback.jpg'}" alt="${project.title}">
      <p>${project.description}</p>
    `;
    containerElement.appendChild(article);
  }
}

