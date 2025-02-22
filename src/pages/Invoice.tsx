import React from "react";
import { jsPDF } from "jspdf";

interface InvoiceProps {
  orderDetails: {
    orderId: string;
    paymentId: string;
    date: string;
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    customerCity: string;
    customerZip: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    tax: number;
    shipping_charges:number;
    total: number;
  };
}

export function Invoice({ orderDetails }: InvoiceProps) {
  const generatePDF = async () => {
    const doc = new jsPDF();

  

  // Add Company Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Bright Frame Solutions Pvt Ltd", 15, 20);

  // Add Logo (Replace with actual logo)
  const logoUrl = "https://i.ibb.co/jkzdjPYr/FavIcon.jpg"; 
  doc.addImage(logoUrl, "jpeg", 160, 10, 30, 30);

  doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let yPos = 45;
  
    doc.text(`Order ID: ${orderDetails.orderId}`, 15, yPos);
    doc.text(`Payment ID: ${orderDetails.paymentId}`, 140, yPos);
    yPos += 7;
    doc.text(`Date: ${orderDetails.date}`, 15, yPos);
    yPos += 15;
  
    doc.setFontSize(14);
    doc.text("Bill To:", 15, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(orderDetails.customerName, 15, yPos);
    yPos += 7;
    doc.text(orderDetails.customerEmail, 15, yPos);
    yPos += 7;
    doc.text(orderDetails.customerAddress, 15, yPos);
    yPos += 7;
    doc.text(`${orderDetails.customerCity}, ${orderDetails.customerZip}`, 15, yPos);
    yPos += 15;
  
    // Table Header
    doc.setFontSize(14);
    doc.text("Item", 15, yPos);
    doc.text("Quantity", 80, yPos, { align: "center" });
    doc.text("Price", 125, yPos, { align: "right" });
    doc.text("Total", 175, yPos, { align: "right" });
  
    yPos += 5;
    doc.line(15, yPos, 195, yPos);
    yPos += 7;
  
    // Table Content
    doc.setFontSize(12);
    orderDetails.items.forEach((item) => {
      doc.text(item.name, 15, yPos);
      doc.text(item.quantity.toString(), 80, yPos, { align: "center" });
      doc.text(`${item.price.toFixed(2)}`, 125, yPos, { align: "right" });
      doc.text(`${(item.quantity * item.price).toFixed(2)}`, 175, yPos, { align: "right" });
      yPos += 7;
    });
  
    // Totals
    yPos += 10;
    doc.text(`Subtotal: ${orderDetails.subtotal.toFixed(2)}`, 175, yPos, { align: "right" });
    yPos += 7;
    doc.text(`GST (18%): ${orderDetails.tax.toFixed(2)}`, 175, yPos, { align: "right" });
    yPos += 7;
    doc.text(`Shipping charges: ${orderDetails.shipping_charges.toFixed(2)}`, 175, yPos, { align: "right" });
    yPos += 7;
    doc.setFontSize(14);
    doc.text(`Total: ${orderDetails.total.toFixed(2)}`, 175, yPos, { align: "right" });
  
    doc.save(`invoice-${orderDetails.orderId}.pdf`);
  };
  

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Successful 🎉</h3>
      <p className="text-gray-600 mb-4">
        Thank you for your purchase! Your order has been confirmed.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg space-y-3 text-sm">
        <p>
          <span className="font-semibold text-gray-700">Order ID:</span> {orderDetails.orderId}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Payment ID:</span> {orderDetails.paymentId}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Amount Paid:</span>{" "}
          <span className="text-green-600 font-semibold">₹{orderDetails.total.toFixed(2)}</span>
        </p>
      </div>

      <button
        onClick={generatePDF}
        className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition-all flex justify-center items-center gap-2 shadow-md"
      >
        📄 Download Invoice
      </button>
    </div>
  );
}
