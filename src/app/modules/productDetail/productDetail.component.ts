import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productDetail',
  templateUrl: './productDetail.component.html',
  styleUrls: ['./productDetail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  productId: any;
  product: any;
  productImgList: any;
  ImageList: any = [];
  imageBlobUrl: any;
  productTypeName: string = '';
  quantity: number = 1; // Default quantity
  relatedProducts: any[] = [];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('productId');
      if (this.productId) {
        this.getProductDetails();
        this.getRelatedProducts(); // Fetch related products
      } else {
        // Handle error: productId is null
        this.router.navigate(['/']);
      }
    });
    this.getProductType();
  }

  getProductDetails() {
    this.callService.getProductByProductId(this.productId).subscribe((res) => {
      if (res.data) {
        this.product = res.data;
        this.getProductImages();
      } else {
        // Handle error: product not found
        this.router.navigate(['/']);
      }
    });
  }

  getProductImages() {
    this.callService
      .getProductImgByProductId(this.product.productId)
      .subscribe((res) => {
        if (res.data) {
          this.productImgList = res.data;
          for (let productImg of this.productImgList) {
            this.getImage(productImg.productImageName);
          }
        } else {
          // Handle error: no images found
          this.router.navigate(['/']);
        }
      });
  }

  getImage(fileNames: any) {
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);
      this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      this.ImageList.push({
        key: fileNames,
        value: this.imageBlobUrl,
      });
    });
  }

  addToCart(product: any) {
    let userDetail = JSON.parse(sessionStorage.getItem('userDetail') || '{}');
    if (!userDetail.userId) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'Please log in to add items to the cart.',
        toast: true,
        position: 'bottom-right',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    let cart = JSON.parse(
      sessionStorage.getItem(userDetail.userId + 'cart') || '[]'
    );
    let item = cart.find(
      (item: any) =>
        item.productId === product.productId &&
        item.userId === userDetail.userId
    );
    if (item) {
      item.quantity += this.quantity; // Add the selected quantity
    } else {
      cart.push({
        ...product,
        quantity: this.quantity,
        userId: userDetail.userId,
      });
    }
    sessionStorage.setItem(userDetail.userId + 'cart', JSON.stringify(cart));

    Swal.fire({
      icon: 'success',
      title: 'เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว',
      toast: true,
      position: 'bottom-right',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  addRelateToCart(product: any, event: Event) {
    event.stopPropagation();
    let userDetail = JSON.parse(sessionStorage.getItem('userDetail') || '{}');
    if (!userDetail.userId) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'Please log in to add items to the cart.',
        toast: true,
        position: 'bottom-right',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    let cart = JSON.parse(
      sessionStorage.getItem(userDetail.userId + 'cart') || '[]'
    );
    let item = cart.find(
      (item: any) =>
        item.productId === product.productId &&
        item.userId === userDetail.userId
    );
    if (item) {
      item.quantity += 1; // Default quantity for related products
    } else {
      cart.push({
        ...product,
        quantity: 1,
        userId: userDetail.userId,
      });
    }
    sessionStorage.setItem(userDetail.userId + 'cart', JSON.stringify(cart));

    Swal.fire({
      icon: 'success',
      title: 'เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว',
      toast: true,
      position: 'bottom-right',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getProductType() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        const productType = res.data.find(
          (type: any) => type.productTypeId === this.product.productTypeId
        );
        this.productTypeName = productType ? productType.productTypeName : '';
      }
    });
  }

  getRelatedProducts() {
    this.callService.getAllProduct().subscribe(
      (res) => {
        if (res.data) {
          this.relatedProducts = res.data.filter(
            (product: any) => product.productId !== this.productId
          );

          // Fetch images for related products
          this.relatedProducts.forEach((product) => {
            product.imgList = [];
            this.callService
              .getProductImgByProductId(product.productId)
              .subscribe((res) => {
                if (res.data) {
                  this.productImgList = res.data;
                  for (let productImg of this.productImgList) {
                    this.getImageForRelated(productImg.productImageName, product.imgList);
                  }
                }
              });
          });
        } else {
          this.relatedProducts = []; // Fallback to empty array if no data
        }
      },
      (error) => {
        console.error('Error fetching related products', error);
        this.relatedProducts = []; // Handle errors by falling back to an empty array
      }
    );
  }

  getImageForRelated(fileNames: any, imgList: any) {
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
      if (res) {
        let objectURL = URL.createObjectURL(res);
        let imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        imgList.push({
          key: fileNames,
          value: imageBlobUrl,
        });
      }
    });
  }

  viewProductDetail(productId: number) {
    this.router.navigate(['/productDetail', productId]).then(() => {
      window.location.reload();
    });
  }
}



// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CallserviceService } from '../services/callservice.service';
// import { DomSanitizer } from '@angular/platform-browser';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-productDetail',
//   templateUrl: './productDetail.component.html',
//   styleUrls: ['./productDetail.component.css']
// })
// export class ProductDetailComponent implements OnInit {

//   constructor(
//     private callService: CallserviceService,
//     private sanitizer: DomSanitizer,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   productId: any;
//   product: any;
//   productImgList: any;
//   ImageList: any = [];
//   imageBlobUrl: any;
//   productTypeName: string = '';
//   quantity: number = 1; // Default quantity
//   relatedProducts: any[] = [];

//   ngOnInit() {
//     this.route.paramMap.subscribe(params => {
//       this.productId = params.get('productId');
//       if (this.productId) {
//         this.getProductDetails();
//       } else {
//         // Handle error: productId is null
//         this.router.navigate(['/']);
//       }
//     });
//     this.getProductType();
//   }

//   getProductDetails() {
//     this.callService.getProductByProductId(this.productId).subscribe((res) => {
//       if (res.data) {
//         this.product = res.data;
//         this.getProductImages();
//         this.loadRelatedProducts(); // Load related products
//       } else {
//         // Handle error: product not found
//         this.router.navigate(['/']);
//       }
//     });
//   }

//   getProductImages() {
//     this.callService.getProductImgByProductId(this.product.productId).subscribe((res) => {
//       if (res.data) {
//         this.productImgList = res.data;
//         for (let productImg of this.productImgList) {
//           this.getImage(productImg.productImageName);
//         }
//       } else {
//         // Handle error: no images found
//         this.router.navigate(['/']);
//       }
//     });
//   }

//   getImage(fileNames: any) {
//     this.callService.getImageByte(fileNames).subscribe((res) => {
//       let objectURL = URL.createObjectURL(res);
//       this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
//       this.ImageList.push({
//         key: fileNames,
//         value: this.imageBlobUrl
//       });
//     });
//   }

//   addToCart(product: any) {
//     let userDetail = JSON.parse(sessionStorage.getItem('userDetail') || '{}');
//     if (!userDetail.userId) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'กรุณาเข้าสู่ระบบ',
//         text: 'Please log in to add items to the cart.',
//         toast: true,
//         position: 'bottom-right',
//         timer: 3000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     let cart = JSON.parse(sessionStorage.getItem(userDetail.userId + 'cart') || '[]');
//     let item = cart.find((item: any) => item.productId === product.productId && item.userId === userDetail.userId);
//     if (item) {
//       item.quantity += this.quantity; // Add the selected quantity
//     } else {
//       cart.push({ ...product, quantity: this.quantity, userId: userDetail.userId });
//     }
//     sessionStorage.setItem(userDetail.userId + 'cart', JSON.stringify(cart));

//     Swal.fire({
//       icon: 'success',
//       title: 'เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว',
//       toast: true,
//       position: 'bottom-right',
//       timer: 3000,
//       timerProgressBar: true,
//       showConfirmButton: false,
//     });
//   }

//   increaseQuantity() {
//     this.quantity++;
//   }

//   decreaseQuantity() {
//     if (this.quantity > 1) {
//       this.quantity--;
//     }
//   }

//   getProductType() {
//     this.callService.getProductTypeAll().subscribe((res) => {
//       if (res.data) {
//         const productType = res.data.find((type: any) => type.productTypeId === this.product.productTypeId);
//         this.productTypeName = productType ? productType.productTypeName : '';
//       }
//     });
//   }

//   loadRelatedProducts() {
//     this.callService.getAllProduct().subscribe((res) => {
//       if (res.data) {
//         this.relatedProducts = this.shuffleArray(res.data).slice(0, 4);
//         for (let product of this.relatedProducts) {
//           product.imgList = [];
//           this.callService.getProductImgByProductId(product.productId).subscribe((res) => {
//             if (res.data) {
//               product.imgList = res.data.map((img: any) => {
//                 let objectURL = URL.createObjectURL(img);
//                 return this.sanitizer.bypassSecurityTrustUrl(objectURL);
//               });
//             }
//           });
//         }
//       }
//     });
//   }

//   shuffleArray(array: any[]) {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   }

//   OnGetProductById(productId: any) {
//     this.router.navigate(['/productDetail', productId]).then(() => {
//       window.location.reload();
//     });
//   }

//   addRelatedToCart(product: any, event: Event) {
//     event.stopPropagation();
//     let userDetail = JSON.parse(sessionStorage.getItem('userDetail') || '{}');
//     if (!userDetail.userId) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'กรุณาเข้าสู่ระบบ',
//         text: 'Please log in to add items to the cart.',
//         toast: true,
//         position: 'bottom-right',
//         timer: 3000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     let cart = JSON.parse(
//       sessionStorage.getItem(userDetail.userId + 'cart') || '[]'
//     );
//     let item = cart.find(
//       (item: any) =>
//         item.productId === product.productId &&
//         item.userId === userDetail.userId
//     );
//     if (item) {
//       item.quantity += 1;
//     } else {
//       cart.push({ ...product, quantity: 1, userId: userDetail.userId });
//     }
//     sessionStorage.setItem(userDetail.userId + 'cart', JSON.stringify(cart));

//     Swal.fire({
//       icon: 'success',
//       title: 'เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว',
//       toast: true,
//       position: 'bottom-right',
//       timer: 3000,
//       timerProgressBar: true,
//       showConfirmButton: false,
//     });
//   }
// }
