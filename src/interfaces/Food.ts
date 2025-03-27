interface Food {
    id: number;
    name: string;
    price: number;
    status: "available" | "unavailable";
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}