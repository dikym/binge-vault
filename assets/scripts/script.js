const cardContainer = document.querySelector(".card-container");
const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("keyup", handleSearchInput);

function handleSearchInput(event) {
  if (event.key !== "Enter") return;

  searchButton.click();
}

const searchButton = document.querySelector(".search-button");
searchButton.addEventListener("click", showCards);

async function showCards() {
  try {
    const keyword = searchInput.value;
    const movies = await getMovies(keyword);
    const movieCards = movies.map(showMovieCard).join("");
    cardContainer.innerHTML = movieCards;
  } catch (error) {
    if (error.message !== "Incorrect IMDb ID.") {
      showSearchError(error.message);
      return;
    }
    showSearchError("Type a movie or series.");
  }
}

async function getMovies(keyword) {
  return fetch(`http://www.omdbapi.com/?apikey=3e063884&s=${keyword}`)
    .then((response) => {
      if (!response.ok) {
        const { status, statusText } = response;
        throw new Error(`${status} ${statusText}`);
      }

      return response.json();
    })
    .then((response) => {
      if (response.Response === "False") {
        throw new Error(response.Error);
      }

      const { Search: movies } = response;
      return movies;
    });
}

function showMovieCard({ Title: title, Year: year, Poster: poster, imdbID }) {
  const posterSrc =
    poster === "N/A" ? "/assets/img/no-image-placeholder.svg" : poster;

  const card = document.createElement("div");
  card.classList.add("col-lg-2", "col-md-3", "col-sm-4", "col-xs-5", "my-4");

  const maxTitleWidth = 300; // maximum width of title in pixels
  const titleLength = title.length;
  let titleFontSize = 24; // initial font size
  if (titleLength > 15) {
    titleFontSize = Math.floor(24 - (titleLength - 15) / 3);
    if (titleFontSize < 14) {
      titleFontSize = 14;
    }
  }

  const cardContent = `
    <div class="card d-flex flex-column justtiy-content-between h-100">
      <img src="${posterSrc}" class="img-fluid" />
      <div class="card-body d-flex flex-grow-1 flex-column">
        <h5 class="card-title" style="max-width: ${maxTitleWidth}px; font-size: ${titleFontSize}px">${title}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">${year}</h6>
        <button class="btn btn-primary mt-auto modal-button" data-imdbid="${imdbID}" data-bs-toggle="modal" data-bs-target="#card-modal">show detail</button>
      </div>
    </div>
  `;

  card.innerHTML = cardContent;
  return card.outerHTML;
}

function showSearchError(errorMessage) {
  const movieNotFound = `
    <div class="text-center text-muted mt-5">
      <h4><em>${errorMessage}</em></h4>
    </div>
  `;
  cardContainer.innerHTML = movieNotFound;
}

document.addEventListener("click", showDetail);

async function showDetail(event) {
  const isModalButton = event.target.classList.contains("modal-button");

  if (!isModalButton) return;

  const imdbID = event.target.dataset.imdbid;
  const movieDetail = await getMovieDetail(imdbID);
  const modalBody = document.querySelector(".modal-body");
  modalBody.innerHTML = movieDetailTemplate(movieDetail);
}

async function getMovieDetail(imdbID) {
  return fetch(`http://www.omdbapi.com/?apikey=3e063884&i=${imdbID}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return response.json();
    })
    .then((movieDetail) => movieDetail);
}

function movieDetailTemplate({
  Title: title,
  Year: year,
  Released: released,
  Poster: poster,
  Director: director,
  Writer: writer,
  Actors: actors,
  Genre: genre,
  Runtime: runtime,
  Plot: plot,
  Type: type,
  imdbRating,
  totalSeasons,
}) {
  const posterSrc =
    poster === "N/A" ? "assets/img/no-image-placeholder.svg" : poster;
  const seasonsHtml =
    type === "series"
      ? `<li class="list-group-item"><strong>Total Seasons: </strong>${totalSeasons}</li>`
      : "";

  return `
    <div class="container-fluid">
      <div class="row">
        <div class="text-center col-md-3">
          <img src="${posterSrc}" class="img-fluid" />
        </div>
        <div class="col">
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <h4>${title} (${year})</h4>
            </li>
            <li class="list-group-item">
              <strong>Runtime: </strong>${runtime}
            </li>
            <li class="list-group-item">
              <strong>IMDB Rating: </strong>${imdbRating}
            </li>
            <li class="list-group-item">
              <strong>Release: </strong>${released}
            </li>
            ${seasonsHtml}
            <li class="list-group-item">
              <strong>Genre: </strong>${genre}
            </li>           <li class="list-group-item">
              <strong>Actors: </strong>${actors}
            </li>
            <li class="list-group-item">
              <strong>Director: </strong>${director}
            </li>
            <li class="list-group-item">
              <strong>Writer: </strong>${writer}
            </li>
            <li class="list-group-item">
              <strong>Synopsis:</strong><br />${plot}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}
