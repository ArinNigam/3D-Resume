import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

const client = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { wa_id, email, first_name, last_name, address } = body;

        console.log(`Processing phone_number: ${wa_id}`);

        const user = {
            wa_id,
            email,
            name: first_name,
            last_name,
        };
        console.log("User processed:", user);

        // Simulate address creation
        const newAddress = {
            address_line: address.address_line,
            city: address.city,
            state: address.state,
            country: address.country,
            zipcode: address.zipcode,
        };
        console.log("Address processed:", newAddress);

        // Create payment
        let payment;
        try {
            payment = await client.payments.create({
              payment_link: true,
              billing: {
                city: newAddress.city,
                country: newAddress.country,
                state: newAddress.state,
                street: newAddress.address_line,
                zipcode: newAddress.zipcode,
              },
              customer: { email: user.email, name: user.name },
              product_cart: [
                {
                  product_id: process.env.PRODUCT_ID || "default_product_id",
                  quantity: 1,
                  amount: 100,
                },
              ],
            });
            console.log("Payment created successfully:", payment.payment_id);
        } catch (error: any) {
            console.error("Failed to create payment:", error.message);
            return NextResponse.json(
                { message: "Failed to create payment", error: error.message },
                { status: 500 }
            );
        }

        // Simulate saving payment to database
        const newPayment = {
            payment_id: payment.payment_id,
            payment_link: payment.payment_link,
            payment_status: "initiated",
            payment_json: payment,
        };
        console.log("Payment saved to database successfully:", newPayment);

        return NextResponse.json({
            message: "Payment Link sent successfully",
            payment_link: newPayment.payment_link,
        });
    } catch (error: any) {
        console.error("Error processing payment:", error.message);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}