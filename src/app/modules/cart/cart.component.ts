import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: any[] = [];
  userDetail: any;
  imageBlobUrl: SafeResourceUrl;

  constructor(private callService: CallserviceService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.userDetail = JSON.parse(sessionStorage.getItem('userDetail') || '{}');
    this.loadCart();
  }

  loadCart() {
    this.cart = JSON.parse(sessionStorage.getItem(this.userDetail.userId + 'cart') || '[]');
    this.cart.forEach(item => {
      item.imgList = [];
      this.callService.getProductImgByProductId(item.productId).subscribe((res) => {
        if (res.data) {
          for (let productImg of res.data) {
            this.getImage(productImg.productImageName, item.imgList);
          }
        }
      });
    });
  }

  removeFromCart(product: any) {
    this.cart = this.cart.filter(item => item.productId !== product.productId);
    sessionStorage.setItem(this.userDetail.userId + 'cart', JSON.stringify(this.cart));
  }

  getImage(fileNames: any, imgList: any) {
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
      if (res) {
        let objectURL = URL.createObjectURL(res);
        this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        imgList.push({
          key: fileNames,
          value: this.imageBlobUrl,
        });
      }
    });
  }
}
