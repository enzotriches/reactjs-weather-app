import React, {useState, useEffect} from 'react' 
/** I'm using axios because fetch is not supported in older browsers */
import axios from "axios";
/** In this app i chose not to use styled-components architecture,
 *  i think that styled-componts is great for animations and a more organized project.
 *  but in this case, where the app is simple i prefer to use just CSS.
*/
import './App.css';

function App() {
  //Hooks that holds if we are using the navigator geolocation
  const [isGeolocationEnable, setIsGeolocationEnable] = useState(false);
  //Hook that holds the location that we should fetch from our weather api
  const [currentLocation, setCurrentLocation] = useState({});
  /**
   * The hook city,state and country are created to hold the 3 inputs of the form,
   * normally, i would create a controller to manage the form, but, my the idea was to keep it simple what
   * is simple. So would have no need to create a separed controller to the form.
   */
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const [isCityError, setIsCityError] = useState(true);
  const [isStateError, setIsStateError] = useState(true);
  const [isCountryError, setIsCountryError] = useState(true);

  const [isGeralError, setIsGeralError] = useState(false);
  

  const [isEnabled, setIsEnabled] = useState(false);
  /**
   * I chose to use useEffect to every time 
   * that, with the dependencies of the error hooks, 
   * update or mount, verify if the submit to the api 
   *  by the form should be ready or not
   */
  useEffect(() => {
    
    if (!isCityError && !isStateError && !isCountryError) {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  
  }, [isCityError, isStateError, isCountryError]);
  /** Variable that manage to see if there is something in the location */
  let isLocalized =  Object.keys(currentLocation).length === 0;
  /**
   * Function that control the 3 inputs of the form, managing to do the 
   * validation and insertion of the respective data 
   */
  const handleInputChange = (text, type) => {

    /** In this case, i believe that regex was a better solution to a 
     * validation in the client side because we dont have a complex
     * validation that would be dificult to understand with regex,
     * and if it is, other person would know what the express do
     * by the variable name.
     */
    const regexOnlyTwoCharacters =  /^[a-zA-Z]{2}$/;
    const regexOnlyCharactersAndSpaces = /^[a-zA-Z ]*$/;

    //I did a switch to see what input am i changing and applying the respective validation
    switch (type) {
      case "state":
        (regexOnlyTwoCharacters.test(text)) ? setIsStateError(false) :  setIsStateError(true);
         setState(text)
        break;
      case "country":
        (regexOnlyTwoCharacters.test(text)) ?  setIsCountryError(false) : setIsCountryError(true);
        setCountry(text)
        break;
      case "city":
        (regexOnlyCharactersAndSpaces.test(text)) ? setIsCityError(false) : setIsCityError(true);
        setCity(text) 
        break;
      default:
        break;
    }
  }
  /**
   * Function that handle when the form is submited by the button
   */
  const handleSubmitButton = (event) => {
    //prevent the navigador to submit
    event.preventDefault();
    /*
    * i chose to set the geolocation to false, to we have the data that we are using the data of the form not
    * the navigator geolocation
    */
    setIsGeolocationEnable(false); 
    //if enable hook is true we can do the request
      if(isEnabled){
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&appid=bb4764a9433157d317e12eb7c2407786`)
        .then((res) => {
          setCurrentLocation(res.data);
        })
        .catch(e => {
          setIsGeralError(true);
        })
        .finally(()=>{
          cleanInputs();
        });
      }
     
  }
  /**
   * I make a function that manage to get the current location of the browser
   */
  const handleGetLocation = () => {

    if("geolocation" in navigator){


      navigator.geolocation.getCurrentPosition(
        (position)=>{

          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setIsGeolocationEnable(true); 

          axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=bb4764a9433157d317e12eb7c2407786`)
            .then((res) => {
              console.log(res.data);
              setCurrentLocation(res.data);
            })
            .catch(e => {
              setIsGeralError(true);
            })
            .finally(()=>{
              /** I manage to clean the inputs */
              cleanInputs();
            });
        },
        ()=>{
          setIsGeolocationEnable(false);
        }
      );
     
    }else{
      setIsGeolocationEnable(false);
    }
  } 
  /**
   * I created a function to clean the values and erros of the inputs
   */
  const cleanInputs = () => {
    setCity("");
    setState("");
    setCountry("");
    setIsCityError(true);
    setIsStateError(true);
    setIsCountryError(true);
  }
  
  const parseKelvinTo = (value, type) => {
    /*
    * Here we could use memoization to dont do the calcule to parse Kelvin for Celsius and 
    * Fahrenheit more than one time,
    * but the calcule of temperature measures is not a expensive calcule to do,
    * and by itself already is very fast 
    */
    switch (type){
      case "celsius":
        return (value - 273.15).toFixed(2);
      case "fahrenheit":
        return (((value- 273.15)*(9/5)) + 32).toFixed(2);
       default:
         return value;
    }
  }

  return (
    <div className="App">
      { isLocalized ? 
      (<>Please, enter the data or enable your current location</>) 
      :
       
      (
        <section className="information">
        {/* I chosed to use the <section> tag for a better SEO */}
          {/* Location */}
          <div className="displaySystem">
            <h1>{currentLocation.name},  {currentLocation.sys.country}</h1>
          </div>
          {/* Simple information about the weather */}
          <div className="displayWeather">
            {/* The API return a array of objetc's , thats why im mapping */}
            {currentLocation.weather.map((item, index) =>
                (
                  <div className="displayWeatherItem" key={index}>
                    <h3>{item.main}</h3>
                    <img  src={`http://openweathermap.org/img/wn/${item.icon}.png`} alt={item.description}/>
                    
                  </div>
                )
            )}
          
          </div>
          {/* Main information about the weather */}
          <div className="displayMain">
         
            <div className="displayMainInfo">
              <h1>
                {parseKelvinTo(currentLocation.main.temp,"celsius")}°C
                |
                {parseKelvinTo(currentLocation.main.temp,"fahrenheit")}°F
              </h1>
              <small>{currentLocation.main.temp}K</small>
            </div>
            
            <div className="displayMainDetails">

              <div className="displayMainDetailsItem">
                <h4>Feels like:</h4>
                <h3> 
                {parseKelvinTo(currentLocation.main.feels_like, "celsius")}°C 
                | 
                {parseKelvinTo(currentLocation.main.feels_like, "fahrenheit")}°F</h3>

                <small>{currentLocation.main.feels_like}K</small>           
              </div>

              <div className="displayMainDetailsItem">
                <h4>Humity:</h4>
                <h3>{currentLocation.main.humidity}K</h3>
              </div>

              <div className="displayMainDetailsItem">
                <h4>Min/Max:</h4>
                <h3>
                {parseKelvinTo(currentLocation.main.temp_min, "celsius")}°C |  {parseKelvinTo(currentLocation.main.temp_max, "celsius")}°C
                <br/>
                {parseKelvinTo(currentLocation.main.temp_min, "fahrenheit")}°F | {parseKelvinTo(currentLocation.main.temp_max, "fahrenheit")}°F</h3>
                <small>{currentLocation.main.temp_min}K x {currentLocation.main.temp_max}K</small>
              </div>

              <div className="displayMainDetailsItem">
                <h4>Sunrise | Sunset</h4>
                <h3>
                { new Date((currentLocation.sys.sunrise) * 1000).getHours()}am 
                |
                { new Date((currentLocation.sys.sunset) * 1000).getHours()}pm
                </h3>
              </div>

              <div className="displayMainDetailsItem">
                <h4>Wind speed | Wind deg</h4>
                <h3>
                  {currentLocation.wind.speed}km/h 
                  <br/>
                  {currentLocation.wind.deg}°
                </h3>
              </div>

              <div className="displayMainDetailsItem">
                <h4>Clouds</h4>
                <h3>{currentLocation.clouds.all}%</h3>
              </div>

            </div>
          </div>

        </section>
      )}  
      {/* I chosed to use the <aside> tag for a better SEO, intead of a <div> */}
       <aside>
       {/* General error handling */}
       {(isGeralError) ? (<><small>Sorry... Try later</small><br/></>) : null }
        <form>
                {/* City input and error handling */}
              <label htmlFor="inputCityName">City name</label><br/>
              {(isCityError) ? (<small style={{color:"gray"}}>City name need to have only letters</small>) : null} 
              <input placeholder="Ex: Sombrio" id="inputCityName" name="inputCityName"
                onChange={(e)=>handleInputChange(e.target.value, "city")}
                value={city}
              />
                {/* State input and error handling */}
              <label htmlFor="inputStateCode">State code</label><br/>
              {(isStateError) ? (<small style={{color:"gray"}}>State code need to have only 2 letters</small>) : null}
              <input placeholder="Ex: SC" id="inputStateCode" name="inputStateCode"
                onChange={(e)=>handleInputChange(e.target.value, "state")}
                value={state}
              />
                {/* Country input and error handling */}
              <label htmlFor="inputCountryCode">Country code</label><br/>
              {(isCountryError) ? (<small style={{color:"gray"}}>Country code need to have only 2 letters</small>): null}
              <input placeholder="Ex: BR" id="inputCountryCode" name="inputCountryCode"
                onChange={(e)=>handleInputChange(e.target.value, "country")}
                value={country}
              />

              <br/>

              <button 
                onClick={(e)=>handleSubmitButton(e)}
              >
                Send
              </button>
              
          </form>

           or <br/>
          
          <button onClick={handleGetLocation}>Get my current location</button><br/>
          {isGeolocationEnable ? <small>Enabled</small>: <small>Disbled</small>}

       </aside> 
    
    </div>
  );
}

export default App;
 