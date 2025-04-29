import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";

const webhook = new Webhook(process.env.WEBHOOK_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const headers = req.headers;
        const webhookHeaders = {
            "webhook-id": headers.get("webhook-id") || "",
            "webhook-signature": headers.get("webhook-signature") || "",
            "webhook-timestamp": headers.get("webhook-timestamp") || "",
        };

        const body = await req.json();
        const raw = JSON.stringify(body);
        const isVerified = await webhook.verify(raw, webhookHeaders);

        if (!isVerified) {
            console.error("Webhook verification failed");
            return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
        }

        const paymentId = body.data.payment_id;
        
        return NextResponse.json({ message: "Payment updated" }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to update payment:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
