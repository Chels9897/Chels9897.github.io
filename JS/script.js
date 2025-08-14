// Weather API Configuration
const myApiKey = "df5ed081f4d8381a1f0b5c8c88aed473"; // Consider moving to environment variables in production

/**
 * Creates a new HTML element with optional classes and text content.
 *
 * @param {string} elementName - The tag name of the HTML element to create (e.g., 'div', 'p', 'img', 'h2').
 * @param {string[]} [classNames=[]] - An optional array of class names to add to the element.
 * @param {string} [contentText=''] - An optional string of text content to set for the element.
 * @returns {HTMLElement} The newly created HTML element.
 */
function createHtmlElement(elementName, classNames = [], contentText = '') {
    const htmlElement = document.createElement(elementName);
    classNames.forEach(className => htmlElement.classList.add(className));
    if (contentText) {
        htmlElement.textContent = contentText;
    }
    return htmlElement;
}

/**
 * Creates a loading placeholder card
 */
function createLoadingCard() {
    const card = createHtmlElement("article", ["weatherInfo", "card", "loading"]);
    const loadingText = createHtmlElement('p', ["loading-text"], "Loading weather data...");
    card.appendChild(loadingText);
    return card;
}

/**
 * Creates an error card for failed weather requests
 */
function createErrorCard(cityName) {
    const card = createHtmlElement("article", ["weatherInfo", "card", "error"]);
    const errorTitle = createHtmlElement('h2', ["cardTitle", "error-title"], cityName || "Unknown City");
    const errorText = createHtmlElement('p', ["error-text"], "Failed to load weather data");
    card.appendChild(errorTitle);
    card.appendChild(errorText);
    return card;
}

/**
 * Fetches current weather information for a specified city from the OpenWeather API.
 * 
 * @param {string} [city="Calgary"] - The name of the city for which to retrieve weather data.
 */
async function loadWeatherInfo(city = "Calgary") {
    const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const apiUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${myApiKey}&units=metric`;
    
    const weatherContainer = document.getElementById("weatherCards");
    if (!weatherContainer) {
        console.error('Weather container not found!');
        return;
    }

    // Create and show loading card
    const loadingCard = createLoadingCard();
    weatherContainer.appendChild(loadingCard);

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Weather data for ${city}:`, data);

        // Remove loading card
        weatherContainer.removeChild(loadingCard);

        // Extract information required to create weather card
        const cityName = data.name;
        const countryCode = data.sys.country;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const iconCode = data.weather[0].icon;
        const weatherType = data.weather[0].main;
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h

        // Create weather card
        const card = createHtmlElement("article", ["weatherInfo", "card"]);

        // City name and country
        const cardTitleElement = createHtmlElement('h2', ["cardTitle"], `${cityName}, ${countryCode}`);
        card.appendChild(cardTitleElement);

        // Weather type
        const cardSubTitleElement = createHtmlElement('h3', ["cardSubTitle"], weatherType);
        card.appendChild(cardSubTitleElement);

        // Weather icon
        const iconContainerElement = createHtmlElement("div", ["iconContainer"]);
        const iconElement = createHtmlElement("img", ["weatherIcon"]);
        iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        iconElement.alt = `${description} weather icon`;
        iconContainerElement.appendChild(iconElement);
        card.appendChild(iconContainerElement);

        // Temperature
        const tempElement = createHtmlElement("p", ["cardInfo", "temperature"], `${temp}°C`);
        card.appendChild(tempElement);

        // Feels like temperature
        const feelsLikeElement = createHtmlElement("p", ["cardInfo", "feels-like"], `Feels like ${feelsLike}°C`);
        card.appendChild(feelsLikeElement);

        // Additional weather info
        const detailsContainer = createHtmlElement("div", ["weather-details"]);
        
        const humidityElement = createHtmlElement("p", ["cardInfo", "detail"], `Humidity: ${humidity}%`);
        const windElement = createHtmlElement("p", ["cardInfo", "detail"], `Wind: ${windSpeed} km/h`);
        
        detailsContainer.appendChild(humidityElement);
        detailsContainer.appendChild(windElement);
        card.appendChild(detailsContainer);

        // Add click animation
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });

        // Append card to the weather container
        weatherContainer.appendChild(card);

    } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error);
        
        // Remove loading card and show error card
        if (weatherContainer.contains(loadingCard)) {
            weatherContainer.removeChild(loadingCard);
        }
        
        const errorCard = createErrorCard(city);
        weatherContainer.appendChild(errorCard);
    }
}

/**
 * Initialize weather data loading when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, fetching weather data...');
    
    // Load weather for multiple cities
    const cities = ["Calgary", "Invermere", "Banff"];
    
    cities.forEach((city, index) => {
        // Stagger the API calls slightly to avoid rate limiting
        setTimeout(() => {
            loadWeatherInfo(city);
        }, index * 200);
    });
});