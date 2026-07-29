// Backend stores review scores on a 1-10 scale; the UI displays 5-star ratings.
export const toStars = (score: number): number => score / 2;
export const toScore = (stars: number): number => stars * 2;
