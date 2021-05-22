/*nice select jquery library for select box*/

$('.selectfilter').niceSelect();

/*function when user write words the input will be empty from words */

function writeInput (){
    
    var input = document.querySelector('.input-search form input')
    
    var span = document.querySelector('.input-search form .tokensymbol')
    
    
    
    input.onkeyup = function(){
        
        span.classList.add('hide')
        
         if(input.value == "") {
        
        span.classList.remove('hide')
    }
    }
    
   
}


writeInput()

/*when click on filter icon show filter view */
function showFilter (){
    
    
    var filterIcon = document.querySelector('.input-search form .searchfilter')
    
    let show = false;
    
    var filtersearch = document.querySelector('.filtersearch')
    
    
    filterIcon.onclick = function(){
        
        
        if(!show){
            
            filtersearch.classList.add('show')
            
            filterIcon.classList.add('changeColor')
            show = true
        }else {
            
            filtersearch.classList.remove('show')
            filterIcon.classList.remove('changeColor')
            show = false
        }
    }
}

showFilter ()



/*toggle bewtween cards and table view */

function showGridCardview(){
    
    
    var cardsIcon = document.querySelector('.tableview')
    
    var gridIcon = document.querySelector('.input-search .filtersearch .column4 .col3 .grid')
    
    var tableView = document.querySelector('.gridview')
    var cardsView = document.querySelector('.cardsview')
    
    var spanGrid = document.querySelectorAll('.grid span')
    
    
    
    cardsIcon.onclick = function(){
        
        cardsView.classList.add('show')
        tableView.classList.add('hide')
        
        spanGrid.forEach((item)=>{
            
            item.classList.add('light')
        })
        
        cardsIcon.classList.add('brightness')
    }
    
    gridIcon.onclick = function(){
        
       tableView.classList.remove('hide')
        cardsView.classList.remove('show')
         spanGrid.forEach((item)=>{
            
            item.classList.remove('light')
        })
        cardsIcon.classList.remove('brightness')
    }
}

showGridCardview()












