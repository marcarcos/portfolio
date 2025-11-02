import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const title = document.querySelector('.projects-title');
if (title && projects?.length) {
  title.textContent += ` (${projects.length})`;
}

// ====== Show year under each project ======
projectsContainer.querySelectorAll('article').forEach((article, i) => {
  const p = document.createElement('p');
  p.textContent = projects[i].year;
  p.style.color = 'gray';
  p.style.fontFamily = 'Baskerville, serif';
  p.style.fontVariantNumeric = 'oldstyle-nums';
  article.appendChild(p);
});

// ====== Setup elements ======
const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');
const searchInput = document.querySelector('.searchBar');
let query = '';
let selectedIndex = -1;

// ====== Shared filter function ======
function filterProjects() {
  return projects.filter((proj) => {
    const values = Object.values(proj).join('\n').toLowerCase();
    const matchesQuery = values.includes(query.toLowerCase());
    const matchesYear =
      selectedIndex === -1 ||
      proj.year === currentData[selectedIndex]?.label;
    return matchesQuery && matchesYear;
  });
}

// ====== Pie chart rendering function ======
let currentData = [];

function renderPieChart(projectsData) {
  // Clear old chart and legend
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // Rollup all projects (not just filtered ones) by year
  const rolledData = d3.rollups(projectsData, (v) => v.length, (d) => d.year);
  currentData = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(currentData);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('data-year', currentData[i].label)  // optional
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        updateSelection();
      });
  });

  currentData.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        updateSelection();
      });
  });
}


// ====== Update selected slice / legend / project list ======
function updateSelection() {
  // Update which wedge and legend item is selected
  svg.selectAll('path')
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : null));
  legend.selectAll('li')
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : null));

  // Filter projects based on query + selected slice
  const filtered = filterProjects();
  renderProjects(filtered, projectsContainer, 'h2');
}

// ====== Search event listener ======
searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  // reset selected wedge to avoid mismatch after filtering
  selectedIndex = -1;

  const filtered = filterProjects();
  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);  // now safe, because selectedIndex is reset
});


// ====== Initial render ======
renderPieChart(projects);
