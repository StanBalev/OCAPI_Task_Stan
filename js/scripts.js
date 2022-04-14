$(document).ready(function () {
    getAuthorization();
    getProductsData();
    createBasket();
    createShipment();
    var width = $(window).width();
    $(window).on('resize', function () {
        if ($(this).width() !== width) {
            width = $(this).width();
            console.log(width);
        }
    });
    // ADD THIS PRODUCT TO BASKET
    $('.addToBasket').click(function () {
        //get product id clikcing the add to card buttton		
        var getPid = $(this).parent().find('.card-pid');
        // get acces token from sessions storage	
        sessionStorage.setItem("getPid", getPid[0].innerText);

        addProductToBasket();
    });

    $(".dropdown").hover(
        function () {
            $('.dropdown-content').css("display", "block");
        }, function () {
            $('.dropdown-content').css("display", "none");
        }
    );
    //order cards
    $('.card').each(function (i) {
        var $this = $(this);
        var newClass = "card" + i++;
        $this.addClass(newClass);
    });
    //unset session storage items ... not working 
    window.addEventListener("beforeunload", function (e) {
        //sessionStorage.setItem('access_token','')
        //sessionStorage.setItem('basket_ID','')
    }, false);
});


// get access token and basket id from sessionStorage
var access_token = sessionStorage.getItem('access_token');
var basket_ID = sessionStorage.getItem('basket_ID');
var token = 'Bearer ' + access_token;

// CALCULATE PRODUCT PRICES WHEN ADDED TO BASKET - GENERAL
function calcProductPrices(productPrice) {
    var basketTotal = 0;
    var tax = 0;
    var productPrice = productPrice;
    if (!isNaN(productPrice)) {
        if (productPrice >= 10 && productPrice <= 19) {
            tax = 5;
            basketTotal = productPrice + tax;

        }
        if (productPrice >= 20 && productPrice <= 29) {
            tax = 7;
            basketTotal = productPrice + tax;
        }
        if (productPrice >= 30 && productPrice <= 99) {
            tax = 11;
            basketTotal = productPrice + tax;
        }
        if (productPrice >= 100) {
            tax = 21;
            basketTotal = productPrice + tax;
        }
        return { basketTotal, tax, productPrice };
    }
    return 0;

}

// BUILD API URLS - GENERAL
function buildResourceUrls(resource) {
    var base_api_url = "https://zycm-002.sandbox.us01.dx.commercecloud.salesforce.com/s/Sites-RefArch-Site/dw/shop/v21_10/";

    switch (resource) {
        case 'baskets':
            return base_api_url + 'baskets/'
            break;
        case 'orders':
            return base_api_url + 'orders'
            break;
        default:
            return base_api_url;
    }
}

// UPDATE THE CURRENT BASKET -  API:BASKET
function updateCurrentBasket() {
    var queryURL = buildResourceUrls('baskets') + basket_ID;//+"&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";		

    $.ajax({
        type: "get",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            var currentBasket = res;

            var totalPrice = 0;
            var totalTaxes = 0;
            var totalProdPrices = 0;
            var calcPrice;
            var y = 1;
            //clear appedned basket data
            $('.dropdown-content a').remove();
            $('.orderTotal').empty();
            for (let i = 0; i < Object.keys(currentBasket.product_items).length; i++) {


                calcPrice = calcProductPrices(currentBasket.product_items[i].price);
                totalPrice += calcPrice.basketTotal;
                totalTaxes += calcPrice.tax;
                totalProdPrices += calcPrice.productPrice;
                //update basket items count
                $('a#basket')[0].innerText = 'Basket (' + currentBasket.product_items.length + ')';
                $('.dropdown-content').append("<a class=\"item\" href='#'> <b>" + y++ + ". " + currentBasket.product_items[i].product_name + "</b><br> * Price: $" + currentBasket.product_items[i].price + " + Tax: $" + parseFloat(calcPrice.tax).toFixed(2) + "</b></a>");

            }

            $('.orderTotal').append("<p class=\"text-center total\">Product(s) cost: $" + parseFloat(totalProdPrices).toFixed(2) + "</p> <p class=\"text-center total\">Total Taxes: $" + parseFloat(totalTaxes).toFixed(2) + "</p><p class=\"text-center total\">Order Total: $" + parseFloat(totalPrice).toFixed(2) + " <p class=\"text-center\"> Your products:</p>")
            // hook kere
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// SET PRICE ADJUSTMENTS - API:BASKETS/PRICE_ADJUSTMENTS
function setPriceAdjustments() {

    var queryURL = buildResourceUrls('baskets') + basket_ID + '/price_adjustments';//+"&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";		

    $.ajax({
        type: "POST",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            "discount": {
                "type": "amount",
                "value": 5
            },
            //"item_id": sessionStorage.getItem('getPid'),
            "item_text": "string",
            "level": "order",
            "price": 1000
        }),
        success: function (res) {
            var currentBasket = res;
            setShipmentAdjustedPrices();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });



}

// SET SHIPMENT ADJUSTED PRICES -  API:BASKETS
function setShipmentAdjustedPrices() {

    var queryURL = "https://zycm-002.sandbox.us01.dx.commercecloud.salesforce.com/s/Sites-RefArch-Site/dw/shop/v21_10/baskets";
    $.ajax({
        type: "POST",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(
            /*	{
                "discount": {
                    "type": "amount",
                    "value": 5
                },
                //"item_id": sessionStorage.getItem('getPid'),
                "item_text": "string",
                "level": "order",
                }*/

            {
                "shipping_items": [
                    {
                        "adjusted_tax": 1,
                        "base_price": 2,
                        "item_id": "string",
                        "item_text": "string",
                        "price": 3,
                        "price_adjustments": [
                            {
                                "applied_discount": {
                                    "amount": 2,
                                    "percentage": 10,
                                    "price_book_id": "string",
                                    "type": "percentage"
                                },
                                "coupon_code": "string",
                                "created_by": "string",
                                "creation_date": "2022-04-12T07:58:20.183Z",
                                "custom": true,
                                "item_text": "string",
                                "last_modified": "2022-04-12T07:58:20.183Z",
                                "manual": true,
                                "price": 0,
                                "price_adjustment_id": "string",
                                "promotion_id": "string",
                                "promotion_link": "string",
                                "reason_code": "PRICE_MATCH"
                            }
                        ],
                        "price_after_item_discount": 1000,
                        "shipment_id": "me",
                        "tax": 0,
                        "tax_basis": 0,
                        "tax_class_id": "string",
                        "tax_rate": 0
                    }
                ],
            }),
        success: function (res) {
            var currentBasket = res;
            placeOrder();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });



}

// CREATE SHIPMENT - API:BASKETS/SHIPMENTS
function createShipment() {
    var queryURL = buildResourceUrls('baskets') + basket_ID + '/shipments';

    $.ajax({
        type: "post",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            "shipment_id": "me2you",
            "shipping_method":
            {
                "id": "stan-delivery",
            },
            "shipping_address":
            {
                "first_name": "John",
                "last_name": "Smith",
                "city": "Boston",
                "country_code": "US",
            },
        }),
        success: function (res) {
            console.log(res);
            setShippingMethod();


        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// SET PAYMENT METHOD -  API:BASKETS/PAYMENT_INSTRUMENTS
function setPaymentMethod() {
    var queryURL = buildResourceUrls('baskets') + basket_ID + '/payment_instruments';

    var cardNumber = $('#cardNumber')[0].value;
    var cardHolder = $('#nameOnCard')[0].value;
    var cardType = 'Visa';
    var expirationMonth = parseInt($('#expirationmm')[0].value);
    var expirationYear = parseInt($('#expirationyy')[0].value);
    var securityCode = $('#secCode')[0].value;

    //form data
    var paymentFormData = {
        "amount": 1.0,
        "payment_card": {
            "number": cardNumber,
            "security_code": securityCode,
            "holder": cardHolder,
            "card_type": cardType,
            "expiration_month": expirationMonth,
            "expiration_year": expirationYear
        },
        "payment_method_id": "CREDIT_CARD",
        "c_strValue": "any custom value"
    }
    //dummy data
    /*const paymentFormData = {
        "amount": 1.0,
        "payment_card": {
            "number": '4263982640269299',
            "security_code": '837',
            "holder": 'stan balev',
            "card_type": "Visa",
            "expiration_month": 02,
            "expiration_year": 2023
        },
        "payment_method_id": "CREDIT_CARD",
        "c_strValue": "any custom value"
    };*/
    $.ajax({
        type: "POST",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(paymentFormData),
        success: function (res) {
            var productItems = res;

            placeOrder();
        },
        error: function (request, status, error) {
            alert(request.responseText);
            //console.log(request.responseText);
        }
    });
}

// PLACE THE ORDER -  API:ORDER
function placeOrder() {
    var queryURL = buildResourceUrls('orders');
    $.ajax({
        type: "post",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ 'basket_id': basket_ID }),
        success: function (data) {
            var basketID = data;
            alert('Your order has been successfully accepted, please check your email address for further information.')
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// SET SHIPPING METHOD API:BASKETS/SHIPPING_METHOD
function setShippingMethod() {
    var queryURL = buildResourceUrls('baskets') + basket_ID + '/shipments/me/shipping_method';
    $.ajax({
        type: "put",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            "id": "stan-delivery",
        }),
        success: function (res) {
            console.log(res);
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });

}

// SET BILLING ADDRESS - API:BASKETS/BILLING_ADDRESS
function setBillingAddress() {
    var queryURL = buildResourceUrls('baskets') + basket_ID + "/billing_address?use_as_shipping=true&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    //form fields data
    var address1 = $('#address1')[0].value;
    var city = $('#city')[0].value;
    var countryCode = $('#countryCode')[0].value;
    var firstName = $('#firstName')[0].value;
    var lastName = $('#lastName')[0].value;
    var postalCode = $('#postalCode')[0].value;
    var phoneNumber = $('#phoneNumber')[0].value;

    $.ajax({
        type: "put",
        url: queryURL,
        headers: {
            "Authorization": token,
        },
        contentType: "application/json; charset=utf-8",

        data: JSON.stringify({
            //dummy data to avoid filling the form each time
            /*'address1': 'address1',
            'address2': 'address2',
            'city': 'city1',
            'country_code': 'countryCode1',
            'first_name': 'firstName1',
            'last_name': 'lastName1',
            'postal_code': 'postalCode1',
            'phone': 'phoneNumber1',*/
            //actual data from form fields
            'address1': address1,
            'city': city,
            'country_code': countryCode,
            'first_name': firstName,
            'last_name': lastName,
            'postal_code': postalCode,
            'phone': phoneNumber,

        }),
        success: function (res) {
            var billingAddress = res;
            console.log(billingAddress);
            setShippingMethod();
            //createShipment();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// GET PRODUCTS INITIAL DATA - API: PRODUCTS
function getProductsData() {
    //get product data
    var queryProducts = "https://zycm-002.sandbox.us01.dx.commercecloud.salesforce.com/s/RefArch/dw/shop/v21_10/products/(atari-pipe-mania-pspM,gpx-ml638bM,easports-madden-nfl-09-wiiM,midway-cruisn-wiiM,namco-eternal-sonata-ps3M,sony-psp-consoleM,easports-nascar-09-ps3M,namco-we-ski-wiiM,sega-bass-fishing-wiiM)?expand=images%2Cprices&all_images=true&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    $.ajax({
        url: queryProducts,
        type: 'GET',
        dataType: 'json', // added data type
        success: function (res) {
            var data = res.data;
            $.each(res.data, function (i) {
                //assign product data to cards
                $('.card' + i + ' .card-title').html(data[i].name);
                $('.card' + i + ' .card-text').html("$" + data[i].price);
                $('.card' + i + ' .card-pid').html(data[i].id);
                $('.card' + i + ' img').attr("src", data[i].image_groups[0].images[0].dis_base_link);
                $('.card' + i + ' img').attr("alt", data[i].image_groups[0].images[0].alt);
            });
            equalizeCardHeights();
        }
    });
}

// ADD PRODUCT TO BASKET - API:BASKETS
function addProductToBasket() {
    var pid = sessionStorage.getItem('getPid');

    if (basket_ID != null) {
        var queryURL = buildResourceUrls('baskets') + basket_ID + "/items?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        $.ajax({
            type: "post",
            url: queryURL,
            headers: {
                "Authorization": token,
            },
            contentType: "application/json; charset=utf-8",

            data: JSON.stringify(

                [{
                    'product_id': pid,
                    'quantity': 1,
                }],
                {
                    "shipment_id": "me2you"
                },


            ),
            success: function (res) {
                var productItems = res;
                $('#openFirstModal')[0].click();
                //update basket items count
                updateCurrentBasket();
                //							
                //open modal form

            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });
    } else return null
}

// GET AUTH TOKEN - API:AUTH
function getAuthorization() {
    var getTokenURL = "https://zycm-002.sandbox.us01.dx.commercecloud.salesforce.com/dw/oauth2/access_token?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    $.ajax({
        type: "post",
        url: getTokenURL,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic c3RhbmlzbGF2LmJhbGV2QHphdXRyZS5jb206TkBWIXRlYzAwMG46YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFh',
        },
        data: {
            grant_type: 'urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken',
        },
        success: function (data) {
            var access_token = data.access_token;
            sessionStorage.setItem("access_token", access_token);


        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// CREATE BASKET - API:BASKETS
function createBasket() {
    var getBasket = "https://zycm-002.sandbox.us01.dx.commercecloud.salesforce.com/s/Sites-RefArch-Site/dw/shop/v21_10/baskets";
    $.ajax({
        type: "post",
        url: getBasket,
        headers: {
            "Authorization": token,
        },
        success: function (data) {
            var basketID = data.basket_id;
            sessionStorage.setItem("basket_ID", basketID);
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// EQUALIZE CARD HEIGHTS - GENERAL
function equalizeCardHeights() {
    var maxHeight = 0;

    var divs = jQuery(".col .card");

    jQuery.each(divs, function () {
        var height = jQuery(this).height();
        if (maxHeight < height)
            maxHeight = height;

    });
    divs.height(maxHeight);
}
