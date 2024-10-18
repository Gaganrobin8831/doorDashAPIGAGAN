import { DoorDashClient } from "@doordash/sdk";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const client = new DoorDashClient({
  developer_id: process.env.DEVELOPER_ID,
  key_id: process.env.KEY_ID,
  signing_secret: process.env.SIGNING_SECRET,
});

// Step 1: Create an initial order
const orderResponse = await client.createDelivery({
  external_delivery_id: uuidv4(),
  pickup_address: "1000 4th Ave, Seattle, WA, 98104",
  pickup_phone_number: "+12025559803",
  dropoff_address: "1201 3rd Ave, Seattle, WA, 98101",
  dropoff_phone_number: "+12025553535",
  order_value: 1000, // in cents, $10.00
  order_contains: {
    alcohol: false,
    pharmacy_items: false,
    age_restricted_pharmacy_items: false,
    tobacco: false,
    hemp: false,
    otc: false,
  },
  items: [
    {
      name: "Pizza Margherita", 
      quantity: 1,
      price: 1000, // $10.00 in cents
      description: "Delicious pizza topped with fresh tomatoes and mozzarella.",
      product_id: "PIZZA_MARGHERITA_001" // Add a unique identifier
    },
    {
      name: "Garlic Bread", 
      quantity: 1,
      price: 500, // $5.00 in cents
      description: "Warm garlic bread with herbs.",
      product_id: "GARLIC_BREAD_001" // Add a unique identifier
    },
  ],
  action_if_undeliverable: "return_to_pickup",
});
console.log(JSON.stringify(orderResponse,null,2));

// Store order details for later reference (e.g., in a database)
const orderDetails = {
  external_delivery_id: orderResponse.data.external_delivery_id,
  items: orderResponse.data.items, // Capture the original items here
};

// Step 2: Cancel the order
// You would typically have a function to cancel the order here
await client.cancelDelivery(orderDetails.external_delivery_id);

// Step 3: Create a return order using the original items
const returnResponse = await client.createDelivery({
  external_delivery_id: uuidv4(),
  pickup_address: "1000 4th Ave, Seattle, WA, 98104",
  pickup_phone_number: "+12025559803",
  dropoff_address: "1201 3rd Ave, Seattle, WA, 98101",
  dropoff_phone_number: "+12025553535",
  order_value: orderDetails.items.reduce((acc, item) => acc + item.price * item.quantity, 0), // Calculate total value
  order_contains: {
    alcohol: false,
    pharmacy_items: false,
    age_restricted_pharmacy_items: false,
    tobacco: false,
    hemp: false,
    otc: false,
  },
  items: orderDetails.items.map(item => ({
    ...item,
    quantity: 1, // Adjust quantity as needed for the return
  })),
  action_if_undeliverable: "return_to_pickup",
});

// Log the return order response
console.log("Return Delivery Created: ", JSON.stringify(returnResponse,null,2));
