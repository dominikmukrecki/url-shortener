import { styleContent } from './style';

// src/error/head.ts
export const headContent = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Błąd - nie znaleziono strony</title>
    <!-- Adding Roboto font from Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        ${styleContent} /* Assuming you've imported styleContent from style.ts */
    </style>
`;
