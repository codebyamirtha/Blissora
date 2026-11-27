/* =====================================
        BLISSORA - HOME PAGE
===================================== */

/* Welcome Message */

window.onload = function () {

    console.log("Welcome to Blissora!");

    showDailyQuote();

    updateFooterYear();

};

/* =====================================
        DAILY MOTIVATIONAL QUOTE
===================================== */

const quotes = [

    "Every day is a new beginning.",

    "Take a deep breath and smile.",

    "Small steps lead to big changes.",

    "You are stronger than you think.",

    "Peace begins with a calm mind.",

    "Your mental health matters.",

    "Relax, breathe and believe in yourself."

];

function showDailyQuote() {

    const quoteElement = document.getElementById("dailyQuote");

    if (quoteElement) {

        const randomNumber = Math.floor(Math.random() * quotes.length);

        quoteElement.textContent = quotes[randomNumber];

    }

}

/* =====================================
        SMOOTH SCROLL
===================================== */

const navLinks = document.querySelectorAll('a[href^="#"]');

navLinks.forEach(function(link){

    link.addEventListener("click", function(e){

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});

/* =====================================
        BACK TO TOP BUTTON
===================================== */

const topButton = document.getElementById("topBtn");

window.addEventListener("scroll", function(){

    if(topButton){

        if(window.scrollY > 300){

            topButton.style.display = "block";

        }else{

            topButton.style.display = "none";

        }

    }

});

if(topButton){

    topButton.addEventListener("click", function(){

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/* =====================================
        FOOTER YEAR
===================================== */

function updateFooterYear(){

    const year = new Date().getFullYear();

    const footerYear = document.getElementById("year");

    if(footerYear){

        footerYear.textContent = year;

    }

}