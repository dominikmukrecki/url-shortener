// src/error/style.ts
// improve style for whole page - make an svg contain and after that 62 % of maximum size and center it
export const styleContent = `
    /* Basic reset and full height for body and html */
    body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: 'Roboto', sans-serif; /* Setting Roboto as the default font */
    }

    /* Centering SVG on the page */
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: column;
    }

    /* Limiting SVG size and centering it */
    svg#freepik_stories-404-error-with-a-cute-animal {
        max-width: 62%;
        max-height: 62%;
        overflow: visible;
    }
    .alert-container {
        text-align: center;
        padding: 20px;
    }

    .alert-container h1 {
        font-size: 24px;
        margin-bottom: 16px;
    }

    .alert-container h2 {
        font-size: 18px;
        margin-bottom: 24px;
    }

    .alert-button {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        text-decoration: none;
        color: white;
        background-color: #38668D; /* Change to your preferred color */
        border-radius: 4px;
        transition: background-color 0.3s;
    }

    .alert-button:hover {
        background-color: #39435E; /* Darker shade for hover effect */
    }

`;

// add roboto font and its reference from google fonts - proper content for head.ts file
