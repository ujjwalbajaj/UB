// $('.Flexible-2 .owl-carousel').owlCarousel({
//     loop:false,
//     margin:10,
//     nav:true,
//     dots:false,
//     responsive:{
//         0:{
//             items:1
//         },
//         600:{
//             items:1
//         },
//         1000:{
//             items:1
//         }
//     }
// })


$('.Flexible-3 .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


$('.Flexible-4 .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


$('.Flexible-5 .lpTokenSection .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})





$('.Flexible-5 .TokenSection .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


$('.Flexible-6 .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


$('.Flexible-7 .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


$('.Flexible-8 .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})



$('.top-products .owl-carousel').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})


function hamburgMenu() {



    var hamburgBtn = document.querySelector('.hamburgmenu')


    var list = document.querySelector('nav .navbar .listlinks ul')

    var span1 = document.querySelector('nav .navbar .hamburgmenu span:nth-child(1)')

    var span2 = document.querySelector('nav .navbar .hamburgmenu span:nth-child(2)')

    var span3 = document.querySelector('nav .navbar .hamburgmenu span:nth-child(3)')



    var show = false

    hamburgBtn.onclick = function () {


        if (!show) {

            list.classList.add('slide')
            hamburgBtn.classList.add('rotate')
            span1.classList.add('rotate1')
            span2.classList.add('hide')
            span3.classList.add('rotate3')
            show = true
        } else {

            list.classList.remove('slide')
            hamburgBtn.classList.remove('rotate')
            span1.classList.remove('rotate1')
            span2.classList.remove('hide')
            span3.classList.remove('rotate3')
            show = false
        }
    }
}

hamburgMenu()





function sticky() {


    var navBar = document.querySelector('.mainnav')



    window.onscroll = function () {


        if (pageYOffset > 100) {

            navBar.classList.add('sticky')
        } else {

            navBar.classList.remove('sticky')
        }
    }

}

sticky()








// $('#jntr-select').ddslick({
//     onSelected: function (selectedData) {
//         //callback function: do something with selectedData;
//     }
// });



// $('#demo-htmlselect').ddslick({
//     onSelected: function (selectedData) {
//         //callback function: do something with selectedData;
//     }
// });

// $('#Hodl-select').ddslick({
//     onSelected: function (selectedData) {
//         //callback function: do something with selectedData;
//     }
// });

// $('#reward-token').ddslick({
//     onSelected: function (selectedData) {
//         //callback function: do something with selectedData;
//     }
// });


//reset tag link 



function resetTagLink() {

    document.querySelectorAll('a').forEach((item) => {

        item.onclick = function (event) {

            if (item.getAttribute('href') === "#") {

                event.preventDefault()
            }
        }
    })

}

resetTagLink()



function showpopup() {


    var stakeBtn = document.querySelectorAll('.btnstake')

    var popup = document.querySelector('.mainpopup')

    var closeBtn = document.querySelectorAll('.mainpopup .closebtn span')

    stakeBtn.forEach((item) => {



        if (typeof (item) != 'undefined' && item != null) {
            item.onclick = function (e) {
                e.preventDefault()

                popup.classList.add('show')

            }

        }





    })


    closeBtn.forEach((item) => {

        item.onclick = function (e) {
            e.preventDefault()

            popup.classList.remove('show')

        }
    })

    popup.onclick = function (e) {


        if (e.target.classList.contains('mainpopup')) {


            popup.classList.remove('show')
        }
    }


}



showpopup()











function slideDetails() {


    let detailsBtn = document.querySelectorAll('.details')

    let dropdownlist = document.querySelectorAll('.dropdownlist')

    let chevron = document.querySelectorAll('.dropdetailschevron')

    let detailsLink = document.querySelectorAll('.detailsLink span')

    /*let hodlNow = document.querySelectorAll('.hodlnow')*/
    let show = false

    detailsBtn.forEach((item, index) => {

        item.onclick = function () {
            if (!(dropdownlist[index].classList.contains('slide'))) {

                dropdownlist[index].classList.add('slide')
                chevron[index].classList.add('rotate')
                detailsLink[index].textContent = 'hide';

                /*	hodlNow[index].classList.add('greencolor')
                    hodlNow[index].firstElementChild.textContent = "claim Your Tokens"*/



            } else {

                dropdownlist[index].classList.remove('slide')
                chevron[index].classList.remove('rotate')
                detailsLink[index].textContent = 'details';
                /*	hodlNow[index].classList.remove('greencolor')
                    hodlNow[index].firstElementChild.textContent = "Stake Now"*/

            }

        }
    })
}




slideDetails()
















function showJntrpopup() {

    let btnBuy = document.querySelectorAll('.buyJNTRBe')


    let ShortTermPopup = document.querySelector('.Short-Term-popup')


    let closeBtn = document.querySelector('.closeshort-term')



    btnBuy.forEach((item) => {


        item.onclick = function () {

            ShortTermPopup.classList.add('show')

            document.documentElement.style.overflow = 'hidden'
        }
    })


    closeBtn.onclick = function () {

        ShortTermPopup.classList.remove('show')

        document.documentElement.style.overflow = 'visible'

    }

}



// showJntrpopup()





function hoverLPtokens() {



    let spanTokens = document.querySelectorAll('.toggleLptokens span')


    spanTokens.forEach((item) => {

        item.onmouseenter = function () {

            for (var i = 0; i < spanTokens.length; i++) {

                spanTokens[i].classList.remove('active')

            }

            item.classList.add('active')

        }
    })




}





function chanegAssets() {


    let imgsassets = document.querySelectorAll('.chngeassetimg')

    let txtAssets = document.querySelectorAll('.chanegassets')


    let receiveBlock = document.querySelectorAll('.receiveAssets')


    imgsassets.forEach((item, index) => {

        item.onmouseenter = function () {

            item.classList.add('hide')

            txtAssets[index].classList.add('show')
        }

        receiveBlock.forEach((item, index) => {


            item.onmouseleave = function () {

                txtAssets[index].classList.remove('show')
                imgsassets[index].classList.remove('hide')
            }
        })

    })


}


chanegAssets()




function showtokenLptoken() {


    let spanToken = document.querySelectorAll('.toggleLptokens span')

    let twoSections = document.querySelectorAll('.Flexible-5 .twocards')


    spanToken.forEach((item, index) => {

        item.onclick = function () {


            for (var i = 0; i < spanToken.length; i++) {

                spanToken[i].classList.remove('active')
            }

            item.classList.add('active')

            for (var i = 0; i < twoSections.length; i++) {

                twoSections[i].classList.remove('active')
            }

            twoSections[index].classList.add('active')


        }
    })

}

showtokenLptoken()





