// src/error/index.ts
import { svg404 } from './body/svg';
import { alertContent } from './body/alert';
import { headContent } from './head';

export function getErrorContent(): string {
    return `
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            ${headContent}        
        </head>
        <body>
            ${svg404}
            ${alertContent}
        </body>
        </html>
    `;
}
