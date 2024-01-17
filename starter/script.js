'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// GEOLOCATION API
// Geolocation API is called an API because it is a browser API just like Internationalization, timers or anything that browser give us
// It is a modern API
// There are many modern API. For eg: API to access user's camera and even make users phone vibrate

// This method takes 2 callback function
// 1st callback function will be called on success i.e. when the browser sucessfully gets co-ordinates of current position of the user
// 2nd callback function is the error callback which is going to called when there happens an error while getting the co-ordinates
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       // 1] GET THE GEOLOCATION OF THE USER
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       //   console.log(latitude, longitude);
//       // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

//       // WHAT IS LEAFLET AND SOME OF ITS METHODS?
//       // Here, L is a namespace available to us due to script file we included
//       // .map() takes element by id (means the element in which we wanna display method should map as its id)
//       // .setView() takes 2 arguments
//       // 1. An array of co-ordinates (latitude, longitude)
//       // 2. Zoom-in and Zoom-out of the current location
//       const coords = [latitude, longitude];
//       //   const map = L.map('map').setView([51.505, -0.09], 13);
//       const map = L.map('map').setView(coords, 13);

//       // WHAT IS TILES?
//       // The small boxes that we see when the map loads is called tiles
//       // Maps are made out of those tiles

//       // 2] DISPLAY A MAP
//       // OPERN STREET URL
//       // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',

//       //   attribution:
//       //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       // }).addTo(map);

//       // GOOGLE MAPS URL
//       L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
//         maxZoom: 18,
//         subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
//       }).addTo(map);

//       // TO CREATE MARKER ON MAP
//       // L.marker(coords)
//       //   .addTo(map)
//       //   .bindPopup('A pretty CSS popup.<br> Easily customizable.')
//       //   .openPopup();

//       map.on('click', function (mapEv) {
//         // console.log(mapEv);
//         const { lat, lng } = mapEv.latlng;

//         L.marker([lat, lng])
//           .addTo(map)
//           .bindPopup(
//             L.popup([lat, lng], {
//               maxWidth: 200,
//               maxHeight: 50,
//               autoClose: false,
//               closeOnClick: false,
//               className: 'running-popup',
//             })
//           )
//           .setPopupContent('Workout')
//           .openPopup();
//       });
//     },
//     function () {
//       alert('Inorder to use this app, please give required permission');
//     }
//   );
// }

class Workout {
  #date = new Date();
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.id = this.#genId();
    this.distance = distance;
    this.duration = duration;
  }
  #genId() {
    return +Date.now();
  }
  click() {
    console.log(this);
    this.clicks++;
  }

  setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.name[0].toUpperCase()}${this.name.slice(1)} on ${
      months[this.#date.getMonth()]
    } ${this.#date.getDate()}`;
  }
}

class Run extends Workout {
  constructor(coords, distance, duration, name, cadence) {
    super(coords, distance, duration);
    this.pace = this.#calcPace();
    this.name = name;
    this.cadence = cadence;
    this.setDescription();
  }
  #calcPace() {
    // min/km
    return this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, name, elevation) {
    super(coords, distance, duration);
    this.speed = this.#calcSpeed();
    this.name = name;
    this.elevation = elevation;
    this.setDescription();
  }
  #calcSpeed() {
    // km/h
    return this.distance / (this.duration / 60);
  }
}

const run = new Run([23, -43], 5, 800, 'running', 50);
const cycling = new Cycling([23, -43], 5, 800, 'cycling', 50);

// const run = new Run(5, )

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapFocus = 13;
  constructor() {
    this.#getCurrentPosition();
    this.#getLocalStorage();
    inputType.addEventListener('change', this.#toggleElevationField);
    form.addEventListener('submit', this.#newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this.#moveToPopup.bind(this));
  }

  // GET USER'S GEOLOCATION
  #getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#displayMap.bind(this),
        this.#unsucessful
      );
    }
  }

  #unsucessful() {
    alert('Inorder to use this app, please give required permission');
  }

  #setLocalStorage() {
    localStorage.setItem('workout', JSON.stringify(this.#workouts));
  }
  #getLocalStorage() {
    // if()
    const data = JSON.parse(localStorage.getItem('workout'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(workout => this.#renderWorkout(workout));

    // The below code will not work as there is no map at this point when the page first loads
    // this.#workouts.forEach(workout => this.#showMap(workout));
  }

  // DISPLAY MAP
  #displayMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapFocus);

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    this.#workouts.forEach(workout => this.#showMap(workout));
    this.#map.on('click', this.#showForm.bind(this));
  }

  #showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  #hideForm() {
    [...inputAll].slice(1).forEach(inp => (inp.value = ''));
    [...inputAll].slice(1).forEach(inp => inp.blur());
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  #toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  #renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.name}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.name === 'running') {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
      `;
    }

    if (workout.name === 'cycling') {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  #newWorkout(e) {
    e.preventDefault();

    // Taking the lat, lng of clicked place
    const { lat, lng } = this.#mapEvent.latlng;

    // Take the INPUT DATA
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // Functions for DATA VALIDATION
    const checkNum = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const checkPositive = (...inputs) => inputs.every(inp => inp >= 0);

    // Create running object, if type is running
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // DATA VALIDATION
      if (
        !checkNum(distance, duration, cadence) ||
        !checkPositive(distance, duration, cadence)
      ) {
        console.log(distance);
        return alert('Please enter positive number');
      }

      // Create new object
      workout = new Run([lat, lng], distance, duration, type, cadence);
    }

    // Create cycling object, if type is cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // DATA VALIDATION
      if (
        !checkNum(distance, duration, elevation) ||
        !checkPositive(distance, duration)
      ) {
        return alert('Please enter positive number');
      }

      // Create new object
      workout = new Cycling([lat, lng], distance, duration, type, elevation);
    }

    // Push the workout to the 'workouts' array which will be array of objects
    this.#workouts.push(workout);
    // Render the object on map
    this.#showMap(workout);

    this.#setLocalStorage();

    // Clear inputs
    this.#hideForm();

    // Render the object on list
    this.#renderWorkout(workout);
  }

  #showMap(workout) {
    // CREATING a MARKER on the clicked place
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup(workout.coords, {
          maxWidth: 200,
          maxHeight: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.name}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();
  }
  #moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id == workoutEl.dataset.id
    );

    // this.#map.setView(workout.coords, this.#mapFocus, {
    //   animate: true,
    //   pan: {
    //     duration: 1,
    //   },
    // });
    this.#map.flyTo(workout.coords, this.#mapFocus);

    workout.click();
  }
  reset() {
    localStorage.removeItem('workout');
    location.reload();
  }
}

const runn = new App();

const inputAll = document.querySelectorAll('.form__input');
