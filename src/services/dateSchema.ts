import { z } from 'zod';

export const dateSchema = z.preprocess((arg) => {
    if (typeof arg === 'string') {
        const regexDDMMYYYY = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
        const isValidISODate = !isNaN(Date.parse(arg));

        if (regexDDMMYYYY.test(arg)) {
            const [day, month, year] = arg.split('/').map(Number);
            // The Date object uses zero-based indexing for months
            const date = new Date(year, month - 1, day);
            if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                throw new Error('Invalid date value');
            }
            return date;
        } else if (isValidISODate) {
            // If it's a valid ISO date string, return the Date object
            return new Date(arg);
        } else {
            // If the string does not match the expected formats, return an error
            throw new Error('Invalid date format');
        }
    }
    // If arg is not a string, return it as is (e.g., it could already be a Date)
    return arg;
}, z.date()).optional();
