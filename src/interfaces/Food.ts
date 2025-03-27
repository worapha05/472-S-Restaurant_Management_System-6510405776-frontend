interface Food {
    id?: number;
    name: string;
    price: number;
    status: "AVAILABLE" | "UNAVAILABLE";
    category: "MAIN COURSE"| "DESSERT"| "BEVERAGE";
    description: string;
    image_url: string;
}