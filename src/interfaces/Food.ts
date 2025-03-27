interface Food {
    id: number;
    name: string;
    price: number;
    status: "AVAILABLE" | "UNAVAILABLE";
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}