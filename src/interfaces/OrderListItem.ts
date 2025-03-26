interface OrderListItem {
    id: number;
    description: string;
    quantity: number;
    food: {
        name: string;
        image_url: string;
        price: number;
    };
}