interface Order {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    type: string;
    table_id: number | null;
    status: string;
    payment_method: string;
    sum_price: number;
    address: string | null;
    accept: string | null;
    user_id: number;
    order_lists: OrderList[];
}