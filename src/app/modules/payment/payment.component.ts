import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  order: any = {};
  qrcodelink: string = '';
  promptpay: string = '0957214321';  // The PromptPay number for receiving payments

  constructor(
    private callService: CallserviceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = Number(params.get('orderId'));
      if (orderId) {
        this.fetchOrderDetails(orderId);
      }
    });
  }

  fetchOrderDetails(orderId: number): void {
    this.callService.getOrderDetails(orderId).subscribe(
      response => {
        this.order = response.data;
        this.generateQRCode(this.order.totalAmount);  // Generate QR code after fetching order details
      },
      error => {
        console.error('Error fetching order details:', error);
      }
    );
  }

  generateQRCode(total: any): void {
    this.qrcodelink = `https://promptpay.io/${this.promptpay}/${total}.png`;
  }
}
